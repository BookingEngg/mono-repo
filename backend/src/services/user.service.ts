import moment from "moment";
import R from "ramda";
import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";
import { TokenPayload } from "google-auth-library";

class UserService {
  private userDao = new UserDao();
  private communicationDao = new CommunicationDao();

  public createUser = async (payload: TokenPayload) => {
    const formattedUser = {
      first_name: payload.given_name,
      last_name: payload.family_name,
      email: payload.email,
      email_verified: payload.email_verified,
      user_profile_picture: payload.picture,

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

  public getChatUsers = async (user: IUser) => {
    const chatUsers = await this.userDao.getUserByUserIds(user.friends_ids);
    const lastReceivedChat = await this.communicationDao.getLastReceivedChat(
      user._id,
      user.friends_ids
    );

    const lastReceivedChatMap = R.indexBy(R.prop("_id"), lastReceivedChat);

    const formattedChatUsers = chatUsers.map((user) => {
      const receiverDetails = lastReceivedChatMap[user._id];
      const lastMessage = receiverDetails?.last_message?.message || "";
      const lastOnlineAt = moment(receiverDetails?.last_message?.createdAt)
        .utcOffset("+05:30")
        .format("hh:mm a");

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
