import { JobApplicationStatusEnum, JobTypeEnum } from "./enum";
import { IJobCategory, IEarningModel } from "./job.interface";

// snapshot of the job's terms at the time of application, since the
// underlying job (pricing, due date, etc.) can change after applying
export interface IJobApplicationJobDetails {
  seller_id: string;
  product_id: string;
  brand_name?: string;
  product_link?: string;
  category?: IJobCategory;
  earning_model?: IEarningModel;
  due_date?: number;
}

export interface IJobApplication {
  _id?: string;
  short_id: string;

  job_short_id: string; // against a job short id
  job_details: IJobApplicationJobDetails; // snapshot of the job at the time of application

  user_id: string; // influencer applying for the job
  job_type: JobTypeEnum,

  order_id?: string;
  awb_no?: string;
  link_short_id?: string;

  order_status: JobApplicationStatusEnum;

  is_active?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
