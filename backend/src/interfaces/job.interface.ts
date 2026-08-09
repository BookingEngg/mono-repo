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
  preview_urls?: IJobMedia[]; // media links (images/videos) for the job preview
  brand_name?: string;

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
