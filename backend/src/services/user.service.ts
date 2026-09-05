// Modules
import R from "ramda";
import moment from "moment";
// Dao
import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
import UserProfileDao from "@/dao/userProfile.dao";
import {
  IAddress,
  IProfileCompletion,
} from "@/interfaces/userProfile.interface";
// Interfaces
import { ICommonAuthUser, IUser } from "@/interfaces/user.interface";
import { AccountStatusEnum, UserTypeEnum } from "@/interfaces/enum";
// Constants
import { getSignupRolesAndPrivileges } from "@/constants/roles.constants";
// Validators
import { IUpdateOnboardingPayload } from "@/validators/user.validator";
import { IBrandSignupPayload } from "@/validators/brandSignup.validator";

class UserService {
  private userDao = new UserDao();
  private userProfileDao = new UserProfileDao();
  private communicationDao = new CommunicationDao();

  public createUser = async (
    payload: ICommonAuthUser,
    userType: UserTypeEnum,
  ) => {
    const { roles, privileges } = getSignupRolesAndPrivileges(userType);

    const formattedUser = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      email_verified: payload.email_verified,
      user_profile_picture: payload.user_profile_picture,

      // A creator signs up via OAuth with nothing but a name and email, so
      // they start ONBOARDING and the home screen prompts them through
      // profile, bank and KYC. Completing all three flips them to ACTIVE
      // (see updateOnboardingDetails). Brands have their own path via
      // createBrandSignupUser.
      account_status:
        userType === UserTypeEnum.INFLUENCER
          ? AccountStatusEnum.ONBOARDING
          : AccountStatusEnum.ACTIVE,

      roles,
      privileges,
      friends_ids: [],
      requested_friends: [],
      blocked_user: [],

      group_ids: [],
    };
    return await this.userDao.createUser(formattedUser);
  };

  public getInhouseUserDetailsByEmail = async (email) => {
    return this.userDao.getUserByEmail(email);
  };

  /**
   * Brand's small signup form — no OAuth, no password. The account is
   * created straight into ONBOARDING and immediately signed in (the
   * controller mints the same JWT cookie OAuth would have); email
   * verification happens afterward as an onboarding step, not a signup
   * gate. brand_name fills first_name since a brand has no separate
   * first/last name concept.
   */
  public createBrandSignupUser = async (payload: IBrandSignupPayload) => {
    const { roles, privileges } = getSignupRolesAndPrivileges(
      UserTypeEnum.BRAND,
    );

    const formattedUser = {
      first_name: payload.brand_name,
      last_name: "",
      email: payload.email,
      contact: payload.contact,
      email_verified: false,
      account_status: AccountStatusEnum.ONBOARDING,

      roles,
      privileges,
      friends_ids: [],
      requested_friends: [],
      blocked_user: [],

      group_ids: [],
    };
    return await this.userDao.createUser(formattedUser);
  };

  /**
   * Influencer onboarding — date of birth/gender/social links. Every field
   * is independently optional (dot-notation $set), so filling in just one
   * field never clobbers the others back to null.
   */
  /**
   * Moves an account through its lifecycle (see AccountStatusEnum).
   *
   * Accepts a user id as well as a full document because the callers differ:
   * /verify-payment already has the authenticated user, while a gateway
   * webhook only knows the id stored on the payment row.
   *
   * Idempotent — re-running it with the same status is a harmless no-op, which
   * matters because the browser callback and the webhook both settle the same
   * payment and routinely race.
   */
  public setAccountStatus = async (
    user: IUser | string,
    status: AccountStatusEnum,
  ) => {
    const userId = typeof user === "string" ? user : String(user._id);

    if (!userId) {
      return;
    }

    await this.userDao.updateUserDetailsById(userId, {
      $set: { account_status: status },
    });
  };

  /** Social handles for a user, from their profile document. */
  public getSocialMediaLinks = async (userId: string) => {
    const profile = await this.userProfileDao.getProfileByUserId(userId, [
      "social_media_links",
    ]);

    return profile?.social_media_links ?? {};
  };

  /**
   * The profile page's own read. Kept off GET /user deliberately: bank and PAN
   * details shouldn't ride along on the bootstrap every authenticated request
   * makes, so they're fetched only by the one screen that edits them.
   */
  public getProfileDetails = async (userId: string) => {
    const [user, profile] = await Promise.all([
      this.userDao.getUserByUserId(userId, ["dob", "gender"]),
      this.userProfileDao.getProfileByUserId(userId),
    ]);

    const details = {
      dob: user?.dob ?? null,
      gender: user?.gender ?? null,
      social_media_links: profile?.social_media_links ?? {},
      address: profile?.address ?? {},
      bank_account_number: profile?.bank_account_number ?? null,
      ifsc_code: profile?.ifsc_code ?? null,
      pan: profile?.pan ?? null,
    };

    return { ...details, completion: this.deriveCompletion(details) };
  };

  /**
   * Which setup steps are done. Derived from the fields themselves rather than
   * stored, so the flags can't drift from what's actually filled in.
   *
   * Social links are not part of "basic details": a creator without a public
   * handle still has a complete profile, and requiring one would strand them
   * on the onboarding widgets forever.
   */
  private deriveCompletion = (details: {
    dob?: Date | null;
    gender?: string | null;
    address?: IAddress;
    bank_account_number?: string | null;
    ifsc_code?: string | null;
    pan?: string | null;
  }): IProfileCompletion => {
    const address = details.address ?? {};

    const basic_details = Boolean(
      details.dob &&
        details.gender &&
        address.addr &&
        address.city &&
        address.state &&
        address.pincode,
    );
    const bank_details = Boolean(
      details.bank_account_number && details.ifsc_code,
    );
    const kyc_details = Boolean(details.pan);

    return {
      basic_details,
      bank_details,
      kyc_details,
      is_complete: basic_details && bank_details && kyc_details,
    };
  };

  /** Completion flags for a user, for the home widgets. */
  public getProfileCompletion = async (
    userId: string,
  ): Promise<IProfileCompletion> => {
    const [user, profile] = await Promise.all([
      this.userDao.getUserByUserId(userId, ["dob", "gender"]),
      this.userProfileDao.getProfileByUserId(userId, [
        "address",
        "bank_account_number",
        "ifsc_code",
        "pan",
      ]),
    ]);

    return this.deriveCompletion({
      dob: user?.dob,
      gender: user?.gender,
      address: profile?.address,
      bank_account_number: profile?.bank_account_number,
      ifsc_code: profile?.ifsc_code,
      pan: profile?.pan,
    });
  };

  public processOnboardingProfile = async (userId: string) => {
    const [user, userProfile] = await Promise.all([
      this.userDao.getUserByUserId(userId, ["account_status"]),
      this.userProfileDao.getProfileByUserId(userId, []),
    ]);

    if (user?.account_status !== AccountStatusEnum.ONBOARDING) {
      return;
    }

    const bankAccountNumber = userProfile?.bank_account_number;
    const ifscCode = userProfile?.ifsc_code;
    const pan = userProfile?.pan;

    if (!bankAccountNumber || !ifscCode || !pan) {
      throw new Error("Complete your onboarding steps");
    }
  };

  /**
   * Profile details now span two documents: dob/gender stay on the user,
   * everything else lives on the user_profile. Both are written here so
   * callers (and the client) still see one operation.
   *
   * Every field is independently optional, so each accordion section on the
   * profile page can save on its own without clearing the others.
   */
  public updateOnboardingDetails = async (
    userId: string,
    payload: IUpdateOnboardingPayload,
  ) => {
    const {
      dob,
      gender,
      social_media_links,
      address,
      bank_account_number,
      ifsc_code,
      pan,
    } = payload;

    const userUpdates: Record<string, unknown> = {};
    if (dob !== undefined) userUpdates.dob = dob;
    if (gender !== undefined) userUpdates.gender = gender;

    // Dot-notation throughout so sending one nested key never wipes its
    // siblings — saving just Instagram must not null out YouTube, and saving
    // just a city must not clear the street.
    const profileUpdates: Record<string, unknown> = {};
    if (bank_account_number !== undefined) {
      profileUpdates.bank_account_number = bank_account_number;
    }
    if (ifsc_code !== undefined) profileUpdates.ifsc_code = ifsc_code;
    if (pan !== undefined) profileUpdates.pan = pan;

    [
      ["social_media_links", social_media_links],
      ["address", address],
    ].forEach(([prefix, group]) => {
      if (!group) return;
      Object.entries(group).forEach(([key, value]) => {
        if (value !== undefined) {
          profileUpdates[`${prefix}.${key}`] = value;
        }
      });
    });

    if (Object.keys(userUpdates).length) {
      await this.userDao.updateUserDetailsById(userId, { $set: userUpdates });
    }

    // Upsert: the profile document is created lazily on first write.
    if (Object.keys(profileUpdates).length) {
      await this.userProfileDao.upsertProfile(userId, profileUpdates);
    }

    const details = await this.getProfileDetails(userId);

    // Finishing every section is what ends a creator's onboarding. Guarded on
    // ONBOARDING so this can never pull a brand out of PENDING_DEPOSIT and
    // hand it job posting without the deposit.
    if (details.completion.is_complete) {
      const user = await this.userDao.getUserByUserId(userId, [
        "account_status",
      ]);
      if (user?.account_status === AccountStatusEnum.ONBOARDING) {
        await this.setAccountStatus(userId, AccountStatusEnum.ACTIVE);
        return { ...details, account_status: AccountStatusEnum.ACTIVE };
      }
    }

    return details;
  };

  public getChatUsers = async (authUser: IUser) => {
    const chatUsers = await this.userDao.getUserByUserIds(authUser.friends_ids);
    const lastReceivedChat = await this.communicationDao.getLastReceivedChat(
      authUser._id,
    );

    const lastReceivedChatMap = R.indexBy(R.prop("_id"), lastReceivedChat);

    // Sort the users accourding to last message
    const sortedChatUsers = chatUsers.slice().sort((a, b) => {
      const senderApproachAKey = `${authUser._id}_${a._id}`;
      const receiverApproachAKey = `${a._id}_${authUser._id}`;

      const senderApproachBKey = `${authUser._id}_${b._id}`;
      const receiverApproachBKey = `${b._id}_${authUser._id}`;

      const userA =
        lastReceivedChatMap[senderApproachAKey] ||
        lastReceivedChatMap[receiverApproachAKey];
      const userB =
        lastReceivedChatMap[senderApproachBKey] ||
        lastReceivedChatMap[receiverApproachBKey];

      const hasUserAChatted = !!userA?.last_message?.createdAt;
      const hasUserBChatted = !!userB?.last_message?.createdAt;

      // If neither has chatted, maintain current order
      if (!hasUserAChatted && !hasUserBChatted) return -1;

      // If only A hasn't chatted, push A down
      if (!hasUserAChatted) return 1;

      // If only B hasn't chatted, push B down
      if (!hasUserBChatted) return -1;

      // Both have chatted, sort by latest message
      const dateA = new Date(userA.last_message.createdAt).getTime();
      const dateB = new Date(userB.last_message.createdAt).getTime();

      return dateB - dateA;
    });

    const formattedChatUsers = sortedChatUsers.map((user) => {
      const senderApproachKey = `${authUser._id}_${user._id}`;
      const receiverApproachKey = `${user._id}_${authUser._id}`;

      const receiverDetails =
        lastReceivedChatMap[senderApproachKey] ||
        lastReceivedChatMap[receiverApproachKey];

      const lastMessage = receiverDetails?.last_message?.message || "";
      const lastOnlineAt = receiverDetails?.last_message?.createdAt
        ? moment(receiverDetails.last_message.createdAt)
            .utcOffset("+05:30")
            .format("hh:mm a")
        : "";

      return {
        id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        time: user.updatedAt,
        profile_picture: user.user_profile_picture,
        last_message: lastMessage,
        last_online_at: lastOnlineAt,
      };
    });

    return formattedChatUsers;
  };

  public getSummaryDetails = async (user_id: string) => {
    const user = await this.userDao.getUserByUserId(user_id);

    const summaryCardsDetails = [
      {
        label: "Friend Requested",
        value: user.requested_friends.length,
      },
      {
        label: "Friends",
        value: user.friends_ids.length,
      },
      {
        label: "Blocked",
        value: user.blocked_user.length,
      },
    ];

    const formattedUserDetails = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      user_profile_picture: user.user_profile_picture,
      summary_cards: summaryCardsDetails,
    };

    return formattedUserDetails;
  };
}

export default UserService;
