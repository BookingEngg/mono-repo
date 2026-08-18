import { IJobApplication } from "@/interfaces/jobApplication.interface";
import JobApplicationModel from "@/models/jobApplication.model";

class JobApplicationDao {
  private jobApplicationModel = JobApplicationModel;

  public createApplication = async (payload: Partial<IJobApplication>) => {
    return await this.jobApplicationModel.create(payload);
  };

  public getApplicationByUserAndJob = async (
    userId: string,
    jobShortId: string,
  ) => {
    return await this.jobApplicationModel
      .findOne({ user_id: userId, job_short_id: jobShortId })
      .lean();
  };

  public getApplicationByShortId = async (shortId: string) => {
    return await this.jobApplicationModel.findOne({ short_id: shortId }).lean();
  };

  public getJobApplicationByUserIds = async (
    userIds: string[],
    orderStatus: string[] = [],
    fields: string[] = [],
  ) => {
    return await this.jobApplicationModel
      .find({
        user_id: { $in: userIds },
        ...(orderStatus.length ? { order_status: { $in: orderStatus } } : {}),
        is_active: true,
      })
      .select(fields)
      .lean();
  };

  public getPaginatedJobApplicationsByUserId = async (payload: {
    userId: string;
    pagination: { page: number; limit: number };
    projection?: string[];
  }) => {
    const { page, limit: pageSize } = payload.pagination;
    const filter = { user_id: payload.userId, is_active: true };

    const [response, count] = await Promise.all([
      this.jobApplicationModel
        .find(filter)
        .select(payload.projection || [])
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.jobApplicationModel.countDocuments(filter),
    ]);

    return { response, count };
  };

  public updateApplicationByShortId = async (
    shortId: string,
    payload: Partial<IJobApplication>,
  ) => {
    return await this.jobApplicationModel.updateOne(
      { short_id: shortId },
      payload,
    );
  };
}

export default JobApplicationDao;
