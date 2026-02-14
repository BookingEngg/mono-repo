import R from "ramda";
import CommunicationDao from "@/dao/communication.dao";
import CommunicationGroupDao from "@/dao/communicationGroup.dao";
import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";
import CommunicationFormatter from "@/formatter/communication.formatter";
import {
  BlockedStatus,
  BlockedType,
  RequestStatusType,
} from "@/constants/common.constants";
import moment from "moment";
import { CommunicationType, GroupType } from "@/interfaces/enum";
import { ICommunication } from "@/interfaces/communication.interface";

class CommunicationService {
  // Dao
  private userDao = new UserDao();
  private communicationDao = new CommunicationDao();
  private communicationGroupDao = new CommunicationGroupDao();

  // Formatter
  private communicationFormatter = new CommunicationFormatter();

  /**
   * Create a new group entry in group DB
   */
  public createGroup = async (
    user: IUser,
    payload: {
      name: string;
      description: string;
      admin_ids: string[];
      members_ids: string[];
      group_type: GroupType;
      profile_picture: string;
    },
  ) => {
    const {
      name = "",
      description = "",
      admin_ids = [user._id],
      members_ids: group_member_ids = [user._id],
      group_type = GroupType.Public,
      profile_picture: group_profile_picture = "",
    } = payload;

    const formattedPayload = {
      name,
      description,
      admin_ids,
      group_member_ids,
      group_type,
      group_profile_picture,

      is_active: true,
      is_visible: true,
    };

    // Create the group
    const groupDetails =
      await this.communicationGroupDao.createGroup(formattedPayload);
    // Set the group id in the user group list
    await this.userDao.setUsersGroupId(
      formattedPayload.group_member_ids,
      groupDetails.short_id,
    );
    return groupDetails;
  };

  /**
   * Update the group details from the short_id
   */
  public updateGroupDetails = async (
    shortId: string,
    payload: {
      name: string;
      description: string;
      admin_ids: string[];
      group_member_ids: string[];
      group_type: GroupType;
      profile_picture: string;
      is_active: boolean;
    },
  ) => {
    const {
      name = "",
      description = "",
      admin_ids = [],
      group_member_ids: group_member_ids = [],
      group_type = GroupType.Public,
      profile_picture: group_profile_picture = "",
      is_active,
    } = payload;

    if (!admin_ids.length) {
      throw new Error("Minimum one admin is required");
    }

    const groupDetails =
      await this.communicationGroupDao.getGroupDetailsByShortId(shortId);
    if (!groupDetails) {
      throw new Error("Group not found");
    }
    const groupMemberIds = groupDetails.group_member_ids;
    admin_ids.forEach((adminId) => {
      if (!groupMemberIds.includes(adminId)) {
        throw new Error("Admin is not a member of the group");
      }
    });

    const formattedPayload = {
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      ...(admin_ids ? { admin_ids } : {}),
      ...(group_member_ids ? { group_member_ids } : {}),
      ...(group_type ? { group_type } : {}),
      ...(group_profile_picture ? { group_profile_picture } : {}),
      ...(is_active ? { is_active } : {}),
    };

    console.log("Payload>>> ", formattedPayload);

    return await this.communicationGroupDao.updateGroupByShortId(
      shortId,
      formattedPayload,
    );
  };

  public createNewChatMessage = async (payload: {
    senderId: string;
    message: string;
    receiverId?: string;
    groupShortId?: string;
    messageType: string;
  }) => {
    const { senderId, receiverId, groupShortId, message, messageType } =
      payload;

    const communicationFormattedPayload = {
      sender_user_id: senderId,
      ...(receiverId ? { receiver_user_id: receiverId } : {}),
      ...(groupShortId ? { group_id: groupShortId } : {}),
      message,
      message_type:
        messageType === "group_message"
          ? CommunicationType.Group
          : CommunicationType.Private,
    };

    await this.communicationDao.createMessage(communicationFormattedPayload);
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
        ["first_name", "last_name"],
      ),
    ]);
    const userDetailsMapper = R.indexBy(R.prop<string>("_id"), usersDetails);

    return this.communicationFormatter.getFormattedChatDetails({
      userDetailsMapper,
      chatDetails,
      receiverId,
    });
  };

  /**
   * Get direct messages between two users
   */
  public getDirectMessages = async (userDetails: IUser, receiverId: string) => {
    const senderId = userDetails._id.toString();

    // Fetch all the messages and receiver user details
    const [{ data: initialMessages, count }, receiverUser] = await Promise.all([
      this.communicationDao.getDirectMessages(senderId, receiverId),
      this.userDao.getUserByUserId(receiverId),
    ]);

    // Create mapper for users
    const userDetailsMapper = R.indexBy(R.prop<string>("_id"), [
      userDetails,
      receiverUser,
    ]);

    // Create mapper for messages by date
    const messagesDataHashByDate: Record<string, ICommunication[]> = R.groupBy(
      (message: ICommunication) =>
        moment(message.createdAt)
          .add(330, "minutes")
          .startOf("date")
          .format("DD MMM YYYY") as unknown as string,
    )(initialMessages);

    const formattedMessages = this.communicationFormatter.getFormattedMessages({
      messagesDataHashByDate,
      userDetailsHashById: userDetailsMapper,
      userId: senderId,
    });

    const formattedEntityDetails = {
      name: receiverUser.first_name + " " + receiverUser.last_name,
      entity_logo: receiverUser.user_profile_picture,
    };

    return {
      meta: {
        count,
      },
      entity_details: formattedEntityDetails,
      messages: formattedMessages,
    };
  };

  /**
   * Get group messages of a user
   */
  public getGroupMessages = async (userDetails: IUser, groupId: string) => {
    const senderId = userDetails._id.toString();

    const groupDetails =
      await this.communicationGroupDao.getGroupDetailsByShortId(groupId, [
        "name",
        "group_profile_picture",
        "group_member_ids",
      ]);

    // Fetch all the messages and receiver user details
    const [{ data: initialMessages, count }, groupMembersUsers] =
      await Promise.all([
        this.communicationDao.getGroupMessages(groupId),
        this.userDao.getUserByUserIds(groupDetails.group_member_ids, [
          "first_name",
        ]),
      ]);

    // Create mapper for users
    const userDetailsMapper = R.indexBy(R.prop<string>("_id"), [
      userDetails,
      ...groupMembersUsers,
    ]);

    // Create mapper for messages by date
    const messagesDataHashByDate: Record<string, ICommunication[]> = R.groupBy(
      (message: ICommunication) =>
        moment(message.createdAt)
          .add(330, "minutes")
          .startOf("date")
          .format("DD MMM YYYY") as unknown as string,
    )(initialMessages);

    const formattedMessages = this.communicationFormatter.getFormattedMessages({
      messagesDataHashByDate,
      userDetailsHashById: userDetailsMapper,
      userId: senderId,
    });

    const formattedEntityDetails = {
      name: groupDetails.name,
      entity_logo: groupDetails.group_profile_picture,
    };

    return {
      meta: {
        count,
      },
      entity_details: formattedEntityDetails,
      messages: formattedMessages,
    };
  };

  /**
   * Get Group Details for the user
   */
  public getGroupDetails = async (groupId: string) => {
    const groupDetails =
      await this.communicationGroupDao.getGroupDetailsByShortId(groupId, []);

    const groupMemberShortIds = groupDetails.group_member_ids;
    const groupAdminShortIds = groupDetails.admin_ids;
    const groupMemberUsers = await this.userDao.getUserByUserIds(
      [...groupMemberShortIds, ...groupAdminShortIds],
      ["email", "_id"],
    );

    const groupMemberUsersMapper = R.indexBy(
      R.prop<string>("_id"),
      groupMemberUsers,
    );

    const adminList = groupDetails.admin_ids
      .map((adminId) => {
        const user = groupMemberUsersMapper[adminId];
        if (!user) return null;
        return {
          label: user.email,
          value: adminId,
        };
      })
      .filter(Boolean);

    const memberList = groupDetails.group_member_ids
      .map((memberId) => {
        const user = groupMemberUsersMapper[memberId];
        if (!user) return null;
        return {
          label: user.email,
          value: memberId,
        };
      })
      .filter(Boolean);

    return {
      short_id: groupDetails.short_id,
      name: groupDetails.name,
      description: groupDetails.description,
      admin: adminList,
      group_members: memberList,
    };
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
                (req_user) => req_user.user_id === verifiedUser._id.toString(),
              )
            : null;

        const blockedDetails =
          tab === "blocked-users"
            ? user.blocked_user.find(
                (req_user) => req_user.user_id === verifiedUser._id.toString(),
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
        RequestStatusType.SEND_REQUEST,
      ),
      this.userDao.addUserFriendRequest(
        friendsId,
        user._id,
        RequestStatusType.RECEIVE_REQUEST,
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

  /**
   * Get list of groups
   * @param user
   */
  public getGroupsList = async (
    user: IUser,
    pageNo: number,
    pageSize: number,
  ) => {
    const [groupDetails, lastMessageOfGroups] = await Promise.all([
      this.communicationGroupDao.getGroupDetailsByShortIds(user.group_ids),
      this.communicationDao.getLastReceivedChatOfGroup(user.group_ids),
    ]);

    const lastMessageOfGroupMap = R.indexBy(R.prop("_id"), lastMessageOfGroups);

    // Sort the groups accourding to last message
    const sortedGroupDetails = groupDetails.slice().sort((groupA, groupB) => {
      const senderApproachGrpA = groupA.short_id;
      const senderApproachGrpB = groupB.short_id;

      const senderGroupAMsg = lastMessageOfGroupMap[senderApproachGrpA];
      const senderGroupBMsg = lastMessageOfGroupMap[senderApproachGrpB];

      if (!senderGroupAMsg && !senderGroupBMsg) {
        return 0;
      }
      if (!senderGroupAMsg) {
        return 1;
      }
      if (!senderGroupBMsg) {
        return -1;
      }
    });

    const formattedChatUsers = sortedGroupDetails.map((group) => {
      const senderApproachGrpA = `${group.short_id}`;
      const receiverDetails = lastMessageOfGroupMap[senderApproachGrpA];

      const lastMessage = receiverDetails?.last_message?.message || "";
      const lastOnlineAt = receiverDetails?.last_message?.createdAt
        ? moment(receiverDetails.last_message.createdAt)
            .utcOffset("+05:30")
            .format("hh:mm a")
        : "";

      return {
        id: group.short_id,
        name: group.name,
        description: group.description,
        total_members: group.group_member_ids.length,
        time: group.updatedAt,
        profile_picture: group.group_profile_picture,
        last_message: lastMessage,
        last_online_at: lastOnlineAt,
      };
    });

    return formattedChatUsers;
  };
}

export default CommunicationService;
