import JobDao from "@/dao/job.dao";
import JobApplicationDao from "@/dao/jobApplication.dao";
import LinkDao from "@/dao/link.dao";
import {
  isJobOpenForApplication,
  buildJobApplicationJobDetails,
} from "@/helper/creatorHub.helper";
import {
  JobApplicationStatusEnum,
  JobTypeEnum,
  LinkEntityType,
} from "@/interfaces/enum";
import {
  ICreateJobPayload,
  IApplyForJobPayload,
} from "@/interfaces/creatorHub.interface";

class CreatorHubService {
  private jobDao = new JobDao();
  private jobApplicationDao = new JobApplicationDao();
  private linkDao = new LinkDao();

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
   * Resolve a redirection link's short_id to its destination URL
   */
  public getLinkDestination = async (shortId: string) => {
    const link = await this.linkDao.getLinkByShortId(shortId);
    if (!link || !link.is_active) {
      throw new Error("Link not found");
    }

    return link.destination_url;
  };
}

export default CreatorHubService;
