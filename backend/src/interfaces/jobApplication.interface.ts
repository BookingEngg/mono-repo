import { JobApplicationStatusEnum, JobTypeEnum } from "./enum";
import { IJobCategory, IEarningModel, IJobMedia } from "./job.interface";

// snapshot of the job's terms at the time of application, since the
// underlying job (pricing, due date, etc.) can change after applying.
// product_name/preview_urls are deliberately NOT snapshotted here — the list
// endpoint resolves them fresh from the Job document (job_short_id) instead,
// same as brand_name is resolved fresh from the seller's user record.
export interface IJobApplicationJobDetails {
  seller_id: string;
  product_id: string;
  product_link?: string;
  category?: IJobCategory;
  earning_model?: IEarningModel;
  // Snapshotted alongside earning_model, and for the same reason: a
  // PERCENTAGE commission is only meaningful against the price it was quoted
  // at. Resolving this fresh from the Job would silently restate an applied
  // creator's earnings every time the brand edited the price.
  selling_price?: number;
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

// Shape returned by GET /creator/job-application. brand_name is resolved from
// the seller's user record (like IJobListItem); product_name/preview_urls are
// resolved fresh from the Job document (job_short_id), not from the
// application's own snapshot.
export interface IJobApplicationListItem {
  short_id: string;
  job_short_id: string;
  job_type: JobTypeEnum;
  brand_name?: string;
  product_name?: string;
  preview_urls?: IJobMedia[];
  // fully-formatted earning text (e.g. "Earn ₹120 per order (10% of ₹1,200)")
  // — see buildEarningModelDisplay in creatorHub.helper.ts
  earning_display?: string;
  // What the creator actually earns per conversion, in rupees. Separate from
  // earning_display so the UI can style the figure on its own rather than
  // parsing it back out of a sentence.
  earning_amount?: number;
  // The price the commission was quoted against, from the apply-time
  // snapshot — not the job's current price.
  selling_price?: number;
  due_date?: number;
  link_short_id?: string;
  createdAt?: Date;
}
