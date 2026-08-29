import { paymentConfig } from "@/config";
import PaymentDao from "@/dao/payment.dao";
import { IUser } from "@/interfaces/user.interface";
import {
  AccountStatusEnum,
  HomeWidgetActionEnum,
  HomeWidgetEnum,
  PaymentTypeEnum,
  privilegesEnum,
  rolesEnum,
} from "@/interfaces/enum";
import { IHomeWidget } from "@/interfaces/home.interface";

class HomeService {
  private paymentDao = new PaymentDao();

  /**
   * Widgets for the signed-in account's home screen.
   *
   * Role gating lives here rather than in the client so the two can't drift:
   * the client renders whatever it is given, which also means a creator can't
   * surface a brand-only action by editing local state.
   *
   * Only brand widgets exist today; a creator gets an empty list, which the
   * UI renders as its own first-run content.
   */
  public getHomeWidgets = async (user: IUser): Promise<IHomeWidget[]> => {
    const roles = user.roles || [];
    const privileges = user.privileges || [];
    const widgets: IHomeWidget[] = [];

    if (roles.includes(rolesEnum.BRAND)) {
      // Deposit first: it's the onboarding blocker, so it should be the thing
      // a new brand sees at the top.
      widgets.push(await this.buildSecurityDepositWidget(user));

      // Mirrors every gate on the route this widget leads to, so the card is
      // never a link to a guaranteed 403:
      //  - privilege, because a brand also holds EXPLORE_JOBS, so the role
      //    alone doesn't distinguish "can post" from "can only view";
      //  - ACTIVE, because posting is blocked until the security deposit
      //    settles (see AuthMiddleware.requireActiveAccount). The deposit
      //    widget sits directly above explaining exactly how to get there.
      const canPostJobs =
        privileges.includes(privilegesEnum.CREATE_JOBS) &&
        user.account_status === AccountStatusEnum.ACTIVE;

      if (canPostJobs) {
        widgets.push(this.buildPostJobWidget());
      }
    }

    return widgets;
  };

  private buildPostJobWidget = (): IHomeWidget => ({
    id: HomeWidgetEnum.POST_JOB,
    title: "Post a job",
    description: "List a new affiliate job for creators to apply to.",
    cta_label: "Post a job",
    action: { type: HomeWidgetActionEnum.CREATE_JOB },
    // No is_completed: posting a job is repeatable, so "done" is meaningless.
  });

  /**
   * The refundable onboarding deposit that becomes the brand's ads balance
   * (see backend/src/models/creator_hub.txt).
   */
  private buildSecurityDepositWidget = async (
    user: IUser,
  ): Promise<IHomeWidget> => {
    const isPaid = await this.paymentDao.hasSuccessfulPayment(
      String(user._id),
      PaymentTypeEnum.SECURITY_DEPOSIT,
    );

    return {
      id: HomeWidgetEnum.SECURITY_DEPOSIT,
      title: "Security deposit",
      description: isPaid
        ? "Your deposit is active and available as marketing spend."
        : "Pay a one time refundable deposit to unlock your marketing spend limit.",
      cta_label: isPaid ? "View details" : "Pay deposit",
      action: {
        type: HomeWidgetActionEnum.PAYMENT_CHECKOUT,
        payment_type: PaymentTypeEnum.SECURITY_DEPOSIT,
      },
      is_completed: isPaid,
      amount: paymentConfig.security_deposit_amount,
      currency: paymentConfig.currency,
    };
  };
}

export default HomeService;
