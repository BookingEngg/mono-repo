import R from "ramda";
import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";
import CommunicationFormatter from "@/formatter/communication.formatter";
import {
  BlockedStatus,
  BlockedType,
  RequestStatusType,
} from "@/constants/common.constants";

class CommunicationService {
  private userDao = new UserDao();
  private communicationDao = new CommunicationDao();

  private communicationFormatter = new CommunicationFormatter();

  public createChat = async (
    data: {
      sender_id: string;
      receiver_id: string;
      message: string;
      message_created_at: Date;
    }[]
  ) => {
    const pendingPromises = [];

    data.forEach((message) => {
      const promise = this.communicationDao.createMessage({
        sender_user_id: message.sender_id,
        receiver_user_id: message.receiver_id,
        message: message.message,
        message_created_at: message.message_created_at,
      });
      pendingPromises.push(promise);
    });

    await Promise.all(pendingPromises);
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
        $ne: user._id, // Current user was not there in the list
        ...(tab === "new-users"
          ? {
              $nin: [
                ...user.friends_ids,
                ...user.blocked_user.map((user) => user.user_id),
                ...user.requested_friends.map((req_user) => req_user.user_id),
              ],
            }
          : {}),
        ...(tab === "friends"
          ? {
              $in: [
                ...user.requested_friends.map((req_user) => req_user.user_id),
                ...user.friends_ids,
              ],
            }
          : {}),
        ...(tab === "blocked-users"
          ? {
              $in: user.blocked_user.map((block_user) => block_user.user_id),
            }
          : {}),
      },
    };

    const { response: verifiedUsers, count } =
      await this.userDao.getPaginatedNewUsers({
        filter: filterObject,
        pagination,
      });

    return {
      data: verifiedUsers.map((verifiedUser) => {
        const friendDetails =
          tab === "friends"
            ? user.requested_friends.find(
                (req_user) => req_user.user_id === verifiedUser._id.toString()
              )
            : null;

        const blockedDetails =
          tab === "blocked-users"
            ? user.blocked_user.find(
                (req_user) => req_user.user_id === verifiedUser._id.toString()
              )
            : null;

        return {
          user_id: verifiedUser._id,
          name: `${verifiedUser.first_name} ${verifiedUser.last_name}`,
          username: verifiedUser.email,

          ...(friendDetails && {
            friends_details: friendDetails,
          }),
          ...(blockedDetails && {
            blocked_details: blockedDetails,
          }),
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
      this.userDao.addUserFriendRequest(
        user._id,
        friendsId,
        RequestStatusType.SEND_REQUEST
      ),
      this.userDao.addUserFriendRequest(
        friendsId,
        user._id,
        RequestStatusType.RECEIVE_REQUEST
      ),
    ]);
  };

  public updateFriendRequestStatus = async (payload: {
    user: IUser;
    friendId: string;
    requestStatus: "approve" | "reject" | "blocked";
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
    } else if (["reject", "blocked"].includes(requestStatus)) {
      const blockOrigin =
        requestStatus === "blocked"
          ? BlockedType.BLOCKED
          : BlockedType.DECLINE_FRIEND_REQ;

      await Promise.all([
        this.userDao.addUserBlockedList({
          userId: user._id,
          friendId,
          blockedStatus: BlockedStatus.SELF_BLOCKED,
          blockOrigin,
        }),
        this.userDao.addUserBlockedList({
          userId: friendId,
          friendId: user._id,
          blockedStatus: BlockedStatus.BLOCKED_BY_PEER,
          blockOrigin,
        }),
      ]);
    } else {
      throw new Error("Invalid Request Status");
    }
  };

  public unblockUserStatus = async (payload: {
    user: IUser;
    friendId: string;
  }) => {
    const { user, friendId } = payload;

    await Promise.all([
      this.userDao.removeUserBlockedList({
        userId: user._id.toString(),
        friendId,
      }),
      this.userDao.removeUserBlockedList({
        userId: friendId,
        friendId: user._id.toString(),
      }),
    ]);
  };
}

export default CommunicationService;
