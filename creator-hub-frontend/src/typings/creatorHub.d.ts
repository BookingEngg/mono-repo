/**
 * Mirrors backend/src/validators/creatorHub.validator.ts's createJobSchema.
 * seller_id and brand_name aren't part of the schema at all — the backend
 * derives both from the authenticated brand account, ignoring anything a
 * client sends. preview_urls (dynamic media list) is intentionally left out
 * of the form for now — everything else the schema accepts is here.
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
  product_link: string;
  category?: IJobCategory;
  earning_model?: IEarningModel;
  due_date?: number;
  age_limit?: IAgeLimit;
  gender?: TGender;
}
