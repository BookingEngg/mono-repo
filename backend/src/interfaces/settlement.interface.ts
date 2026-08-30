import { IJobMedia } from "./job.interface";

/**
 * A brand's settlement position, sliced two ways. Both slices sum the same
 * underlying earnings — job-level answers "which campaign owes money", and
 * creator-level answers "who do I owe" — so their totals always agree.
 *
 * `reversed_amount` is reported but excluded from settled/pending: it was
 * cancelled, so counting it either way would overstate the bill.
 */
export interface ISettlementSummary {
  settled_amount: number;
  pending_amount: number;
  total_amount: number;
}

export interface ISettlementByJobRow {
  job_short_id: string | null;
  product_name?: string;
  preview_urls?: IJobMedia[];
  settled_amount: number;
  pending_amount: number;
  reversed_amount: number;
  conversion_count: number;
  creator_count: number;
}

export interface ISettlementByCreatorRow {
  user_id: string | null;
  creator_name?: string;
  creator_profile_picture?: string;
  settled_amount: number;
  pending_amount: number;
  reversed_amount: number;
  conversion_count: number;
  job_count: number;
}
