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

  public getJobsByShortIds = async (
    shortIds: string[],
    fields: string[] = [],
  ) => {
    return await this.jobModel
      .find({ short_id: { $in: shortIds } })
      .select(fields)
      .lean();
  };

  public incrementCompletedJobCount = async (shortId: string) => {
    return await this.jobModel.updateOne(
      { short_id: shortId },
      { $inc: { "job_count.completed": 1 } }
    );
  };

  public getPaginatedJobs = async (payload: {
    filter: Record<string, unknown>;
    pagination: { page: number; limit: number };
    projection?: string[];
  }) => {
    const { page, limit: pageSize } = payload.pagination;
    const filter = payload.filter || {};

    const [response, count] = await Promise.all([
      this.jobModel
        .find(filter)
        .select(payload.projection || [])
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.jobModel.countDocuments(filter),
    ]);

    return { response, count };
  };
}

export default JobDao;
