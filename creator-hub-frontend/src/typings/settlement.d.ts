/**
 * A brand's settlement position, per creator — "who do I owe, and how much".
 *
 * reversed_amount is reported but excluded from settled/pending: it was
 * cancelled, so counting it either way would overstate the bill.
 */
export interface ISettlementSummary {
  settled_amount: number;
  pending_amount: number;
  total_amount: number;
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
