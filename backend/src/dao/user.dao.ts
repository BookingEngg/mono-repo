import { IUser } from "@/interfaces/user.interface";
import UsersModel from "@/models/user.model";
import {
  BlockedStatus,
  BlockedType,
  RequestStatusType,
} from "@/constants/common.constants";
// import { MAX_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from "@/constants/enum";

class UserDao {
  private userModel = UsersModel;

  public createUser = async (payload: object) => {
    return await this.userModel.create(payload);
  };

  public updateUserDetailsById = async (
    userId: string,
    updatedPayload: object
  ) => {
    return await this.userModel.updateOne({ _id: userId }, updatedPayload);
  };

  // Get the user by email id
  public getUserByEmail = async (email: string): Promise<IUser> => {
    return await this.userModel.findOne({ email }).lean();
  };

  // Get the users by userId
  public getUserByUserId = async (userId: string, fields: string[] = []) => {
    return await this.userModel.findOne({ _id: userId }).select(fields).lean();
  };

  // Get the users by userIds
  public getUserByUserIds = async (
    userIds: string[],
    fields: string[] = []
  ) => {
    return await this.userModel
      .find({ _id: { $in: userIds } })
      .select(fields)
      .lean();
  };

  // Get all the user expect from the source
  public getUsers = async (email: string, fields: string[] = []) => {
    return await this.userModel
      .find({ email: { $ne: email } })
      .select(fields)
      .lean();
  };

  // Get community paginated user list
  public getPaginatedNewUsers = async (payload: {
    filter: object;
    pagination: { page: number; limit: number };
  }) => {
    const { page, limit: pageSize } = payload.pagination;

    const [response, count] = await Promise.all([
      this.userModel
        .find(payload.filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.userModel.countDocuments(payload.filter),
    ]);

    return { response, count };
  };

  /**
   * Set the group id into the single user group list
   * @param userId
   * @param groupId
   */
  public setUserGroupId = async (userId: string, groupId: string) => {
    return await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $addToSet: {
          group_ids: groupId,
        },
      }
    );
  };

  /**
   * Set the group id into the multiple users group list
   * @param userIds
   * @param groupId
   */
  public setUsersGroupId = async (userIds: string[], groupId: string) => {
    return await this.userModel.updateMany(
      {
        _id: { $in: userIds },
      },
      {
        $addToSet: {
          group_ids: groupId,
        },
      }
    );
  };

  // Add friend id into the requested friend list
  public addUserFriendRequest = async (
    userId: string,
    friendId: string,
    requestStatus: RequestStatusType
  ) => {
    return await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $addToSet: {
          requested_friends: {
            user_id: friendId,
            request_status: requestStatus,
          },
        },
      }
    );
  };

  // Add the friend id into the friend list
  public addUserFriendList = async (userId: string, friendId: string) => {
    return await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $addToSet: {
          friends_ids: friendId,
        },
        $pull: {
          requested_friends: {
            user_id: friendId,
          },
        },
      }
    );
  };

  // Add the friend id into the blocked list
  public addUserBlockedList = async (payload: {
    userId: string;
    friendId: string;
    blockedStatus: BlockedStatus;
    blockOrigin: BlockedType;
  }) => {
    const { userId, friendId, blockedStatus, blockOrigin } = payload;

    return await this.userModel.updateOne(
      {
        _id: userId,
      },
      {
        $addToSet: {
          blocked_user: {
            user_id: friendId,
            blocked_status: blockedStatus,
            block_origin: blockOrigin,
          },
        },
        $pull: {
          requested_friends: { user_id: friendId },
          friends_ids: friendId,
        },
      }
    );
  };

  // Remove the friend id from the blocked_user
  public removeUserBlockedList = async (payload: {
    userId: string;
    friendId: string;
  }) => {
    const { userId, friendId } = payload;
    return await this.userModel.updateOne(
      { _id: userId },
      {
        $pull: {
          blocked_user: {
            user_id: friendId,
          },
        },
      }
    );
  };

  // RBAC DAO
  public setRolesAndPrivilegesOfUser = async (payload: {
    user_id: string;
    roles?: string[];
    privileges?: string[];
  }) => {
    const { user_id, roles = [], privileges = [] } = payload;
    return await this.userModel.updateOne(
      {
        _id: user_id,
      },
      {
        $addToSet: {
          ...(roles.length ? { roles: { $each: roles } } : {}),
          ...(privileges.length ? { privileges: { $each: privileges } } : {}),
        },
      }
    );
  };

  public unsetRolesAndPrivilegesOfUser = async (payload: {
    user_id: string;
    roles?: string[];
    privileges?: string[];
  }) => {
    const { user_id, roles = [], privileges = [] } = payload;
    return await this.userModel.updateOne(
      {
        _id: user_id,
      },
      {
        $pull: {
          ...(roles.length ? { roles: { $in: roles } } : {}),
          ...(privileges.length ? { privileges: { $in: privileges } } : {}),
        },
      }
    );
  };
}

export default UserDao;
