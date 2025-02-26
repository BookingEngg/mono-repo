import R from "ramda";
import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";
import CommunicationFormatter from "@/formatter/communication.formatter";

class CommunicationService {
  private userDao = new UserDao();
  private communicationDao = new CommunicationDao();

  private communicationFormatter = new CommunicationFormatter();

  public createChat = async (payload: {
    senderId: string;
    receiverId: string;
    message: string;
  }) => {
    const { senderId, receiverId, message } = payload;
    await this.communicationDao.createMessage({
      sender_user_id: senderId,
      receiver_user_id: receiverId,
      message,
    });
  };

  public getUsersChat = async (userDetails: IUser, receiverId: string) => {
    const senderId = userDetails._id.toString();

    const [chatDetails, usersDetails] = await Promise.all([
      this.communicationDao.getChatDetails({
        user_id: senderId,
        receiverId,
        fields: ["sender_user_id", "receiver_user_id", "message", "createdAt"],
      }),
      this.userDao.getUserByUserIds(
        [senderId, receiverId],
        ["first_name", "last_name"]
      ),
    ]);
    const userDetailsMapper = R.indexBy(R.prop<string>("_id"), usersDetails);

    return this.communicationFormatter.getFormattedChatDetails({
      userDetailsMapper,
      chatDetails,
      receiverId,
    });
  };

  public getCommunityUsers = async (payload: {
    user: IUser;
    pagination: {
      page: number;
      limit: number;
    };
    tab: "friends" | "new-users" | "blocked-users";
  }) => {
    const { user, pagination, tab } = payload;

    const filterObject = {
      _id: {
        $ne: user._id,  // Current user was not there in the list
        ...(tab === "new-users"
          ? {
              $nin: [...user.friends_ids, ...user.blocked_ids, ...user.requested_friends_ids],
            }
          : {}),
        ...(tab === "friends"
          ? {
              $in: [...user.friends_ids, ...user.requested_friends_ids],
            }
          : {}),
        ...(tab === "blocked-users" ? { $in: [...user.blocked_ids] } : {}),
      },
    };

    const { response: verifiedUsers, count } =
      await this.userDao.getPaginatedNewUsers({
        filter: filterObject,
        pagination,
      });

    return {
      data: verifiedUsers.map((user) => {
        return {
          user_id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          username: user.email,
        };
      }),
      meta: {
        count,
      },
    };
  };

  public makeFriendRequest = async (user: IUser, friendsId: string) => {
    const requestedFriendUser = await this.userDao.getUserByUserId(friendsId);
    if (!requestedFriendUser._id) {
      throw new Error("Invalid Friend Request");
    }

    await Promise.all([
      this.userDao.addUserFriendRequest(user._id, friendsId),
      this.userDao.addUserFriendRequest(friendsId, user._id), // Add user id to the friend's request list
    ]);
  };

  public updateFriendRequestStatus = async (payload: {
    user: IUser;
    friendId: string;
    requestStatus: "approve" | "reject";
  }) => {
    const { user, friendId, requestStatus } = payload;

    const requestedFriendUser = await this.userDao.getUserByUserId(friendId);
    if (!requestedFriendUser._id) {
      throw new Error("Invalid Friend Request");
    }

    if (requestStatus === "approve") {
      await Promise.all([
        this.userDao.addUserFriendList(user._id, friendId),
        this.userDao.addUserFriendList(friendId, user._id),
      ]);
    } else if (requestStatus === "reject") {
      await Promise.all([
        this.userDao.addUserBlockedList(user._id, friendId),
        this.userDao.addUserBlockedList(friendId, user._id),
      ]);
    } else {
      throw new Error("Invalid Request Status");
    }
  };
}

export default CommunicationService;
