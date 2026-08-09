import { IJobApplication } from "@/interfaces/jobApplication.interface";
import JobApplicationModel from "@/models/jobApplication.model";

class JobApplicationDao {
  private jobApplicationModel = JobApplicationModel;

  public createApplication = async (payload: Partial<IJobApplication>) => {
    return await this.jobApplicationModel.create(payload);
  };

  public getApplicationByUserAndJob = async (
    userId: string,
    jobShortId: string
  ) => {
    return await this.jobApplicationModel
      .findOne({ user_id: userId, job_short_id: jobShortId })
      .lean();
  };

  public updateApplicationByShortId = async (
    shortId: string,
    payload: Partial<IJobApplication>
  ) => {
    return await this.jobApplicationModel.updateOne(
      { short_id: shortId },
      payload
    );
  };
}

export default JobApplicationDao;
