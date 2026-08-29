import { TPaymentType } from "./payment";

// Mirrors backend HomeWidgetEnum.
export type THomeWidgetId = "security_deposit" | "post_job";

// Mirrors backend HomeWidgetActionEnum. A closed vocabulary rather than a
// server-sent URL: the client owns its own routing, and a server-supplied
// path would be brittle across clients and an open-redirect risk.
export type THomeWidgetActionType = "payment_checkout" | "create_job";

export interface IHomeWidgetAction {
  type: THomeWidgetActionType;
  payment_type?: TPaymentType;
}

export interface IHomeWidget {
  id: THomeWidgetId;
  title: string;
  description?: string;
  cta_label: string;
  action: IHomeWidgetAction;
  // Only present where "done" is meaningful — a one time deposit has it, a
  // repeatable action like posting a job doesn't.
  is_completed?: boolean;
  // Display only — the real charge is re-derived server-side at checkout.
  amount?: number;
  currency?: string;
}
