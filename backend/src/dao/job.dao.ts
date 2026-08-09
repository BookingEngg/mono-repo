import { IJob } from "@/interfaces/job.interface";
import JobModel from "@/models/job.model";

class JobDao {
  private jobModel = JobModel;

  public createJob = async (payload: Partial<IJob>) => {
    return await this.jobModel.create(payload);
  };

  public getJobByShortId = async (shortId: string, fields: string[] = []) => {
    return await this.jobModel
      .findOne({ short_id: shortId })
      .select(fields)
      .lean();
  };

  public decrementAvailableJobCount = async (shortId: string) => {
    return await this.jobModel.updateOne(
      { short_id: shortId, "job_count.available": { $gt: 0 } },
      { $inc: { "job_count.available": -1 } }
    );
  };
}

export default JobDao;
