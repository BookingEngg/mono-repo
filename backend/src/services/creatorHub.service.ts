import JobDao from "@/dao/job.dao";
import JobApplicationDao from "@/dao/jobApplication.dao";
import LinkDao from "@/dao/link.dao";
import EarningDao from "@/dao/earning.dao";
import UserDao from "@/dao/user.dao";
import {
  isJobOpenForApplication,
  buildJobApplicationJobDetails,
  calculateJobApplicationCommission,
  buildJobApplicationListItem,
  buildJobListItem,
  buildJobCheckoutDetails,
  JOB_LIST_PROJECTION,
  JOB_CHECKOUT_PROJECTION,
  JOB_APPLICATION_LIST_PROJECTION,
} from "@/helper/creatorHub.helper";
import {
  JobApplicationStatusEnum,
  JobTypeEnum,
  LinkEntityType,
  ConversionEventSourceEnum,
  ConversionTriggerEnum,
} from "@/interfaces/enum";
import {
  ICreateJobPayload,
  IApplyForJobPayload,
} from "@/interfaces/creatorHub.interface";
import { IRecordConversionPayload } from "@/validators/creatorHub.validator";
import { IUser } from "@/interfaces/user.interface";

class CreatorHubService {
  private jobDao = new JobDao();
  private jobApplicationDao = new JobApplicationDao();
  private linkDao = new LinkDao();
  private earningDao = new EarningDao();
  private userDao = new UserDao();

  // payload is already validated by ValidatorMiddleware.validateRequestBody(createJobSchema)
  public createJob = async (brand: IUser, payload: ICreateJobPayload) => {
    const {
      job_type,
      product_id,
      product_name,
      product_link,
      selling_price,
      preview_urls,
      category,
      earning_model,
      due_date,
      age_limit,
      gender,
    } = payload;

    return await this.jobDao.createJob({
      job_type,
      seller_id: brand._id,
      product_id,
      product_name,
      product_link,
      selling_price,
      preview_urls,
      category,
      earning_model,
      due_date,
      age_limit: age_limit && {
        lower: age_limit.lower ?? null,
        upper: age_limit.upper ?? null,
      },
      gender,
    });
  };

  // brand's display name is not stored on the job — resolved on read from
  // the seller's user record (first_name + last_name)
  private getBrandName = (user?: IUser | null): string | undefined =>
    user ? `${user.first_name} ${user.last_name}` : undefined;

  // Batch-resolves seller_id -> seller (only the fields a brand name needs),
  // shared by every listing that needs to show a brand name without storing
  // it redundantly.
  private resolveSellersBySellerId = async (sellerIds: string[]) => {
    const sellers = await this.userDao.getUserByUserIds(
      [...new Set(sellerIds)],
      ["first_name", "last_name"],
    );
    return new Map(sellers.map((seller) => [String(seller._id), seller]));
  };

  /**
   * Shared by listJobsForInfluencer/listJobsForBrand — runs the paginated
   * query against the given filter and shapes the response identically.
   */
  private buildPaginatedJobsResponse = async (
    filter: Record<string, unknown>,
    pagination: { page: number; limit: number },
  ) => {
    const { response, count } = await this.jobDao.getPaginatedJobs({
      filter,
      pagination,
      projection: JOB_LIST_PROJECTION,
    });

    const sellerById = await this.resolveSellersBySellerId(
      response.map((job) => job.seller_id),
    );

    return {
      jobs: response.map((job) =>
        buildJobListItem(
          job,
          this.getBrandName(sellerById.get(String(job.seller_id))),
        ),
      ),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        total_pages: Math.ceil(count / pagination.limit),
      },
    };
  };

  /**
   * Influencer's explore feed — every currently active/visible job across
   * all brands.
   */
  public listJobsForInfluencer = async (pagination: {
    page: number;
    limit: number;
  }) => {
    return this.buildPaginatedJobsResponse(
      { is_active: true, is_visible: true },
      pagination,
    );
  };

  /**
   * A brand's own posted jobs only — regardless of active/visible state, so
   * a brand can still see jobs it has paused or that have run out.
   */
  public listJobsForBrand = async (
    brandUserId: string,
    pagination: { page: number; limit: number },
  ) => {
    return this.buildPaginatedJobsResponse(
      { seller_id: brandUserId },
      pagination,
    );
  };

  /**
   * Job detail for the influencer's checkout/apply-summary screen. Brand
   * accounts never reach this — gated at the route by role, not here.
   */
  public getJobCheckoutDetails = async (shortId: string) => {
    const job = await this.jobDao.getJobByShortId(
      shortId,
      JOB_CHECKOUT_PROJECTION,
    );

    if (!job || !isJobOpenForApplication(job)) {
      throw new Error("Job not found");
    }

    const seller = await this.userDao.getUserByUserId(job.seller_id, [
      "first_name",
      "last_name",
    ]);

    return buildJobCheckoutDetails(job, this.getBrandName(seller));
  };

  /**
   * Influencer applies for a job — snapshots the job's current terms into
   * the application, and for affiliate jobs mints a redirection link.
   */
  // payload is already validated by ValidatorMiddleware.validateRequestBody(applyForJobSchema)
  public applyForJob = async (userId: string, payload: IApplyForJobPayload) => {
    const { job_short_id } = payload;

    const job = await this.jobDao.getJobByShortId(job_short_id);
    if (!job) {
      throw new Error("Job not found");
    }
    if (!isJobOpenForApplication(job)) {
      throw new Error("Invalid job application");
    }

    const existingJobApplications =
      await this.jobApplicationDao.getJobApplicationByUserIds(
        [userId],
        [JobApplicationStatusEnum.APPLIED],
        [],
      );

    if (existingJobApplications.length >= 3) {
      throw new Error("You can apply for a maximum of 3 jobs at a time");
    }

    const existingApplicationForJob = existingJobApplications.find(
      (jobApplication) => jobApplication.job_short_id === job_short_id,
    );
    if (existingApplicationForJob) {
      throw new Error("You have already applied for this job");
    }

    const jobApplication = await this.jobApplicationDao.createApplication({
      job_short_id,
      user_id: userId,
      job_type: job.job_type,
      job_details: buildJobApplicationJobDetails(job),
      order_status: JobApplicationStatusEnum.APPLIED,
    });

    if (jobApplication.job_type === JobTypeEnum.AFFILIATE) {
      // Create redirection link
      const link = await this.linkDao.createLink({
        destination_url: job.product_link,
        entity_type: LinkEntityType.JOB_APPLICATION,
        entity_id: jobApplication.short_id,
      });
      await this.jobApplicationDao.updateApplicationByShortId(
        jobApplication.short_id,
        { link_short_id: link.short_id },
      );
      jobApplication.link_short_id = link.short_id;
    }

    await this.jobDao.incrementCompletedJobCount(job_short_id);

    return jobApplication;
  };

  /**
   * Every job application the influencer has made, most recent first.
   */
  public listJobApplicationsForInfluencer = async (
    userId: string,
    pagination: { page: number; limit: number },
  ) => {
    const { response, count } =
      await this.jobApplicationDao.getPaginatedJobApplicationsByUserId({
        userId,
        pagination,
        projection: JOB_APPLICATION_LIST_PROJECTION,
      });

    const sellerById = await this.resolveSellersBySellerId(
      response.map((application) => application.job_details.seller_id),
    );

    const jobShortIds = [
      ...new Set(response.map((application) => application.job_short_id)),
    ];
    const jobs = await this.jobDao.getJobsByShortIds(jobShortIds, [
      "short_id",
      "product_name",
      "preview_urls",
    ]);
    const jobByShortId = new Map(jobs.map((job) => [job.short_id, job]));

    return {
      applications: response.map((application) =>
        buildJobApplicationListItem(
          application,
          this.getBrandName(
            sellerById.get(String(application.job_details.seller_id)),
          ),
          jobByShortId.get(application.job_short_id),
        ),
      ),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        total_pages: Math.ceil(count / pagination.limit),
      },
    };
  };

  /**
   * Resolve a redirection link's short_id to its destination URL, and log an
   * inhouse LINK_CLICK conversion for this session — upserted atomically, so
   * if one already exists for this (job_application_short_id, sessionId)
   * pair, no new entry is created.
   */
  public resolveLinkClick = async (shortId: string, sessionId: string) => {
    const link = await this.linkDao.getLinkByShortId(shortId);
    if (!link || !link.is_active) {
      throw new Error("Link not found");
    }
    const jobApplication =
      link.entity_id &&
      (await this.jobApplicationDao.getApplicationByShortId(link.entity_id));

    const isInternalConversionEvent =
      jobApplication &&
      jobApplication?.job_details?.earning_model?.conversion_trigger ===
        ConversionTriggerEnum.LINK_CLICK;

    if (isInternalConversionEvent && link.entity_id) {
      const commission = calculateJobApplicationCommission(jobApplication);

      // A CPC job with no determinable rate must not silently accrue 0 — skip
      // and let it surface as a missing earning rather than a wrong one.
      if (commission) {
        // sessionId is the visitor identifier here, so the unique index
        // collapses repeat clicks within the same 1hr session into one
        // accrual instead of paying per refresh.
        await this.earningDao.accrueForConversion({
          job_short_id: jobApplication.job_short_id,
          job_application_short_id: link.entity_id,
          visitor_id: sessionId,
          trigger: ConversionTriggerEnum.LINK_CLICK,
          event_source: ConversionEventSourceEnum.INHOUSE,
          user_id: jobApplication.user_id,
          seller_id: jobApplication.job_details?.seller_id,
          amount: commission,
          recorded_at: new Date(),
        });
      }
    }

    return {
      destinationUrl: link.destination_url,
      jobApplicationShortId: link.entity_id || "",
    };
  };

  /**
   * Record a conversion event (PDP_VIEW, ORDER_PLACED, etc.) reported by the
   * brand against a job application
   */
  public recordConversion = async (payload: IRecordConversionPayload) => {
    const { utm_params, event_datum } = payload;

    const jobApplicationShortId = utm_params.utm_campaign;
    const visitorId = utm_params.utm_medium;

    const { conversion_type, conversion_time, order_id, awb_no } = event_datum;

    const jobApplication = await this.jobApplicationDao.getApplicationByShortId(
      jobApplicationShortId,
    );
    if (!jobApplication) {
      return { error: "Job Application not found" };
    }

    // The job names ONE trigger as the paying event. Anything else the brand
    // reports is ignored rather than stored: this used to write a row for
    // every reported trigger, which is what made conversions look like a
    // separate high-volume table in the first place.
    const payingTrigger =
      jobApplication.job_details?.earning_model?.conversion_trigger;

    if (!payingTrigger || conversion_type !== payingTrigger) {
      return { ignored: true, reason: "Not the paying trigger for this job" };
    }

    // Priced from the application's own apply-time snapshot, so a later edit
    // to the job can't restate what an existing application pays out.
    const amount = calculateJobApplicationCommission(jobApplication);

    if (amount === undefined) {
      // A percentage job that predates selling_price — accruing 0 would
      // silently under-pay, so refuse rather than guess.
      throw new Error(
        "Commission cannot be determined for this job application",
      );
    }

    const { created } = await this.earningDao.accrueForConversion({
      job_short_id: jobApplication.job_short_id,
      job_application_short_id: jobApplicationShortId,
      visitor_id: visitorId,
      trigger: conversion_type,
      event_source: ConversionEventSourceEnum.BRAND,
      user_id: jobApplication.user_id,
      seller_id: jobApplication.job_details?.seller_id,
      amount,
      order_id,
      awb_no,
      recorded_at: conversion_time,
    });

    // `created: false` means this exact conversion was already accrued — a
    // webhook retry. Still a success from the brand's side, so it stops
    // retrying, but nothing was paid twice.
    return { accrued: created, amount };
  };
}

export default CreatorHubService;
