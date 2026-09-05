import {
  HomeWidgetActionEnum,
  HomeWidgetEnum,
  PaymentTypeEnum,
  ProfileSectionEnum,
} from "./enum";

/**
 * What a widget does when tapped. `type` names the destination in a
 * vocabulary the client already understands; the extra fields are the
 * parameters that destination needs.
 */
export interface IHomeWidgetAction {
  type: HomeWidgetActionEnum;
  payment_type?: PaymentTypeEnum;
  // For OPEN_PROFILE: which section the profile page should expand on arrival.
  section?: ProfileSectionEnum;
}

export interface IHomeWidget {
  id: HomeWidgetEnum;
  title: string;
  description?: string;
  cta_label: string;
  action: IHomeWidgetAction;

  /**
   * Only set for widgets where "done" is a meaningful state — a one time
   * deposit has one, a repeatable action like posting a job doesn't.
   *
   * Completed widgets are returned rather than dropped, so the home screen can
   * show a brand that its deposit is settled instead of the card simply
   * vanishing (which reads as a bug).
   */
  is_completed?: boolean;

  // Present when the widget represents a charge — display only, the real
  // amount is re-derived server-side at checkout.
  amount?: number;
  currency?: string;
}

export interface IHomeWidgetsResponse {
  widgets: IHomeWidget[];
}
