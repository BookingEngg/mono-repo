import { GenderEnum, JobTypeEnum, MediaTypeEnum, EarningModelTypeEnum, ConversionTriggerEnum } from "./enum";

export interface IJobCategory {
  l1?: string;
  l2?: string;
  l3?: string;
  l4?: string;
}

export interface IEarningModel {
  type: EarningModelTypeEnum;
  value: number;
  conversion_trigger: ConversionTriggerEnum;
}

export interface IJobMedia {
  type: MediaTypeEnum;
  url: string;
}

export interface IJob {
  _id?: string;
  short_id?: string;
  job_type: JobTypeEnum;
  seller_id: string; // brand placing the job
  product_id: string;
  product_link: string;
  product_name: string;
  preview_urls?: IJobMedia[]; // media links (images/videos) for the job preview

  category?: IJobCategory;

  job_count: {
    available: number;
    completed: number;
  };
  earning_model?: IEarningModel;

  due_date: number; // no. of days to complete the job

  age_limit?: {
    lower: number | null;
    upper: number | null;
  };
  gender?: GenderEnum;

  is_active: boolean;
  is_visible: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

// Shape returned by GET /creator/job — only what the listing card needs, not
// the full job document (seller_id, product_link, earning_model, etc.)
export interface IJobListItem {
  short_id?: string;
  job_type: JobTypeEnum;
  brand_name?: string; // resolved from the seller's user record, not stored on the job
  product_name: string;
  category?: IJobCategory;
  preview_urls?: IJobMedia[];
  job_count: {
    available: number;
    completed: number;
  };
}

// Shape returned by GET /creator/job/checkout/:shortId — everything the
// checkout summary screen needs on top of the listing shape: what the
// influencer earns and the due date, but still nothing seller_id/internal.
export interface IJobCheckoutDetails extends IJobListItem {
  // fully-formatted earning text (e.g. "Earn 10% of order value") — see
  // buildEarningModelDisplay in creatorHub.helper.ts
  earning_display?: string;
  due_date?: number;
}
