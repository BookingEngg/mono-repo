// Modules
import R from "ramda";
import moment from "moment";
// Dao
import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
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

  public updateOnboardingDetails = async (
    userId: string,
    payload: IUpdateOnboardingPayload,
  ) => {
    const { dob, gender, social_media_links } = payload;

    const updates: Record<string, unknown> = {};
    if (dob !== undefined) updates.dob = dob;
    if (gender !== undefined) updates.gender = gender;
    if (social_media_links) {
      Object.entries(social_media_links).forEach(([platform, value]) => {
        if (value !== undefined) {
          updates[`social_media_links.${platform}`] = value;
        }
      });
    }

    await this.userDao.updateUserDetailsById(userId, { $set: updates });

    return this.userDao.getUserByUserId(userId, [
      "dob",
      "gender",
      "social_media_links",
    ]);
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
