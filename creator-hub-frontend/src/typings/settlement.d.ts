import { IJobMedia } from "./creatorHub";

/**
 * A brand's settlement position. Job-level answers "which campaign owes
 * money", creator-level answers "who do I owe" — both sum the same earnings,
 * so their totals agree.
 *
 * reversed_amount is reported but excluded from settled/pending: it was
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

export interface ISettlementResponse<TRow> {
  status: string;
  settlements: TRow[];
  summary: ISettlementSummary;
}
