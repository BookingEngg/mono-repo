import moment from "moment";
import R from "ramda";
import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
import { ICommonAuthUser, IUser } from "@/interfaces/user.interface";
import { TokenPayload } from "google-auth-library";

class UserService {
  private userDao = new UserDao();
  private communicationDao = new CommunicationDao();

  public createUser = async (payload: ICommonAuthUser) => {
    const formattedUser = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      email_verified: payload.email_verified,
      user_profile_picture: payload.user_profile_picture,

      roles: [],
      level: 1,
      friends_ids: [],
      requested_friends: [],
      blocked_user: [],
    };
    return await this.userDao.createUser(formattedUser);
  };

  public getInhouseUserDetailsByEmail = async (email) => {
    return this.userDao.getUserByEmail(email);
  };

  public getChatUsers = async (authUser: IUser) => {
    const chatUsers = await this.userDao.getUserByUserIds(authUser.friends_ids);
    const lastReceivedChat = await this.communicationDao.getLastReceivedChat(
      authUser._id
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
        user_id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        time: user.updatedAt,
        user_profile_picture: user.user_profile_picture,
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
