/**
 * Mirrors backend/src/validators/creatorHub.validator.ts's createJobSchema.
 * seller_id and brand_name aren't part of the schema at all — the backend
 * derives both from the authenticated brand account (brand_name from the
 * user's first/last name), ignoring anything a client sends. preview_urls
 * accepts a full dynamic media list on the backend; the form only ever
 * sends a single image (see product_image in CreateJob.organism.tsx).
 */
export type TEarningModelType = "PERCENTAGE" | "FIXED_PER_ORDER" | "CPC";

export type TConversionTrigger =
  | "LINK_CLICK"
  | "PDP_VIEW"
  | "ORDER_PLACED"
  | "CANCELLED"
  | "ORDER_DISPATCH"
  | "DELIVERED";

export type TGender = "male" | "female";

export interface IJobCategory {
  l1?: string;
  l2?: string;
  l3?: string;
  l4?: string;
}

export interface IEarningModel {
  type: TEarningModelType;
  value: number;
  conversion_trigger: TConversionTrigger;
}

export interface IAgeLimit {
  lower: number | null;
  upper: number | null;
}

export interface ICreateJobPayload {
  job_type: "affiliate";
  product_id: string;
  product_name: string;
  product_link: string;
  preview_urls?: IJobMedia[];
  category?: IJobCategory;
  earning_model?: IEarningModel;
  due_date?: number;
  age_limit?: IAgeLimit;
  gender?: TGender;
}

export type TJobMediaType = "image" | "video";

export interface IJobMedia {
  type: TJobMediaType;
  url: string;
}

/**
 * Mirrors backend's IJobListItem — the deliberately trimmed shape GET
 * /creator/job returns, not the full job document.
 */
export interface IJobListItem {
  short_id?: string;
  job_type: string;
  brand_name?: string;
  product_name: string;
  category?: IJobCategory;
  preview_urls?: IJobMedia[];
  job_count: {
    available: number;
    completed: number;
  };
}

/**
 * Mirrors backend's IJobCheckoutDetails — everything the checkout summary
 * screen needs on top of the listing shape.
 */
export interface IJobCheckoutDetails extends IJobListItem {
  // fully-formatted earning text (e.g. "Earn 10% of order value") built by
  // the backend — render as-is, don't reconstruct it from a raw value/type.
  earning_display?: string;
  due_date?: number;
}

export interface IJobListPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface IJobListResponse {
  status: string;
  jobs: IJobListItem[];
  pagination: IJobListPagination;
}

/**
 * Mirrors backend's IJobApplicationListItem — GET /creator/job-application.
 * product_name/preview_urls are resolved fresh from the Job document, not
 * snapshotted on the application. link_short_id is only present for
 * affiliate applications; the shareable URL is built client-side from it
 * (see getJobApplicationLink in job.util).
 */
export interface IJobApplicationListItem {
  short_id: string;
  job_short_id: string;
  job_type: string;
  brand_name?: string;
  product_name?: string;
  preview_urls?: IJobMedia[];
  earning_display?: string;
  due_date?: number;
  link_short_id?: string;
  createdAt?: string;
}

export interface IJobApplicationListResponse {
  status: string;
  applications: IJobApplicationListItem[];
  pagination: IJobListPagination;
}
