import { paymentConfig } from "@/config";
import PaymentDao from "@/dao/payment.dao";
import { IUser } from "@/interfaces/user.interface";
import {
  AccountStatusEnum,
  HomeWidgetActionEnum,
  HomeWidgetEnum,
  PaymentTypeEnum,
  privilegesEnum,
  ProfileSectionEnum,
  rolesEnum,
} from "@/interfaces/enum";
import { IProfileCompletion } from "@/interfaces/userProfile.interface";
import UserService from "@/services/user.service";
import { IHomeWidget } from "@/interfaces/home.interface";

class HomeService {
  private paymentDao = new PaymentDao();
  private userService = new UserService();

  /**
   * Widgets for the signed-in account's home screen.
   *
   * Role gating lives here rather than in the client so the two can't drift:
   * the client renders whatever it is given, which also means a creator can't
   * surface a brand-only action by editing local state.
   *
   * A creator gets setup prompts while onboarding; a fully set-up creator
   * gets an empty list, which the UI renders as its own first-run content.
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
    } else if (roles.includes(rolesEnum.INFLUENCER)) {
      widgets.push(...(await this.buildCreatorSetupWidgets(user)));
    }

    return widgets;
  };

  /**
   * Setup prompts for a creator who hasn't finished their profile.
   *
   * Two conditions, both required. ONBOARDING scopes this to accounts still
   * being set up, so a long-standing creator who deliberately left a field
   * blank isn't nagged forever. The per-section completion flags then drop the
   * cards that are already done — the point of these widgets is the work
   * that's left, so a finished section shouldn't keep occupying the home
   * screen the way the security deposit (a receipt) does.
   */
  private buildCreatorSetupWidgets = async (
    user: IUser,
  ): Promise<IHomeWidget[]> => {
    if (user.account_status !== AccountStatusEnum.ONBOARDING) {
      return [];
    }

    const completion = await this.userService.getProfileCompletion(
      String(user._id),
    );

    const sections: {
      done: boolean;
      widget: IHomeWidget;
    }[] = [
      {
        done: completion.basic_details,
        widget: this.buildProfileWidget(
          HomeWidgetEnum.UPDATE_PROFILE,
          ProfileSectionEnum.BASIC_DETAILS,
          "Update your profile",
          "Add your date of birth, gender and address so brands know who they're working with.",
          "Update profile",
        ),
      },
      {
        done: completion.bank_details,
        widget: this.buildProfileWidget(
          HomeWidgetEnum.UPDATE_BANK_DETAILS,
          ProfileSectionEnum.BANK_DETAILS,
          "Add your bank details",
          "We need an account number and IFSC code to pay out what you earn.",
          "Add bank details",
        ),
      },
      {
        done: completion.kyc_details,
        widget: this.buildProfileWidget(
          HomeWidgetEnum.UPDATE_KYC_DETAILS,
          ProfileSectionEnum.KYC_DETAILS,
          "Complete your KYC",
          "Add your PAN to verify your identity before your first payout.",
          "Add PAN",
        ),
      },
    ];

    return sections.filter(({ done }) => !done).map(({ widget }) => widget);
  };

  private buildProfileWidget = (
    id: HomeWidgetEnum,
    section: ProfileSectionEnum,
    title: string,
    description: string,
    ctaLabel: string,
  ): IHomeWidget => ({
    id,
    title,
    description,
    cta_label: ctaLabel,
    // The section travels with the action so the profile page opens the right
    // accordion instead of the client mapping widget ids back to sections.
    action: { type: HomeWidgetActionEnum.OPEN_PROFILE, section },
  });

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
