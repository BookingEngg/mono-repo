import JobDao from "@/dao/job.dao";
import JobApplicationDao from "@/dao/jobApplication.dao";
import LinkDao from "@/dao/link.dao";
import ConversionDao from "@/dao/conversion.dao";
import {
  isJobOpenForApplication,
  buildJobApplicationJobDetails,
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

class CreatorHubService {
  private jobDao = new JobDao();
  private jobApplicationDao = new JobApplicationDao();
  private linkDao = new LinkDao();
  private conversionDao = new ConversionDao();

  // payload is already validated by ValidatorMiddleware.validateRequestBody(createJobSchema)
  public createJob = async (payload: ICreateJobPayload) => {
    const {
      job_type,
      seller_id,
      product_id,
      product_link,
      brand_name,
      preview_urls,
      category,
      earning_model,
      due_date,
      age_limit,
      gender,
    } = payload;

    return await this.jobDao.createJob({
      job_type,
      seller_id,
      product_id,
      product_link,
      brand_name,
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

    const existingJobApplication =
      await this.jobApplicationDao.getApplicationByUserAndJob(
        userId,
        job_short_id,
      );
    if (existingJobApplication) {
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

    await this.jobDao.decrementAvailableJobCount(job_short_id);

    return jobApplication;
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

    if (link.entity_type === LinkEntityType.JOB_APPLICATION && link.entity_id) {
      await this.conversionDao.upsertConversionForVisitor({
        job_application_short_id: link.entity_id,
        visitor_id: sessionId,
        trigger: ConversionTriggerEnum.LINK_CLICK,
        event_source: ConversionEventSourceEnum.INHOUSE,
        recorded_at: new Date(),
      });
    }

    return { destinationUrl: link.destination_url };
  };

  /**
   * Record a conversion event (PDP_VIEW, ORDER_PLACED, etc.) reported by the
   * brand against a job application
   */
  public recordConversion = async (payload: IRecordConversionPayload) => {
    const {
      id,
      conversion_type,
      conversion_time,
      visitor_id,
      order_id,
      awb_no,
    } = payload;

    const jobApplication =
      await this.jobApplicationDao.getApplicationByShortId(id);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    await this.conversionDao.upsertConversionForVisitor({
      job_application_short_id: id,
      trigger: conversion_type,
      event_source: ConversionEventSourceEnum.BRAND,
      visitor_id,
      recorded_at: conversion_time,
      order_id,
      awb_no,
    });
  };
}

export default CreatorHubService;
