import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@database";
import { IUser } from "@/interfaces/user.interface";
import { AccountStatusEnum, GenderEnum, rolesEnum } from "@/interfaces/enum";

const dbConnection = MONGO_INSTANCES.praman;

export const IOrigin = new Schema({
  country: String,
  state: String,
  zipcode: Number,
});

export const IFriendsRequest = new Schema({
  user_id: String, // Sender or receiver user id
  request_status: String, // Status of request
});

export const IBlockedRequest = new Schema({
  user_id: String, // Other person user id
  blocked_status: String, // Blocked by whom
  block_origin: String, // from decline-friend-request or blocked
});

// Derived from rolesEnum so the schema whitelist can't drift out of sync with
// the roles the rest of the app actually assigns (this array was previously
// hand-typed and missing "roles/brand").
export const ROLES = Object.values(rolesEnum);

const UserSchema = new Schema<IUser>(
  {
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    email: { type: String, require: true },
    user_profile_picture: { type: String, default: undefined },
    email_verified: { type: Boolean, default: false },
    contact: { type: String },
    origin: { type: IOrigin, default: undefined },

    // Onboarding lifecycle — see AccountStatusEnum. Every pre-existing OAuth
    // user is already fully set up, so ACTIVE is the safe default.
    account_status: {
      type: String,
      enum: AccountStatusEnum,
      default: AccountStatusEnum.ACTIVE,
    },

    // Influencer onboarding
    dob: { type: Date, default: null },
    gender: { type: String, enum: GenderEnum, default: null },

    // Access Control
    roles: { type: Array(String), enum: ROLES, require: true }, // user, admin, brand, etc.
    privileges: { type: Array(String), required: true }, // contain only the restricted priviledges of the roles.

    // Community Field
    friends_ids: { type: Array(String), default: [] }, // Contain all the friends user id
    requested_friends: { type: Array(IFriendsRequest), default: [] }, // Contain all the users who request to make friend
    blocked_user: { type: Array(IBlockedRequest), default: [] }, // Contain all the blocked users for the perticular user
    // Group Communication
    group_ids: { type: Array(String), default: [] },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/**
 * CONDITIONS FOR USER FRIEND
 * User 1 ==> Current User
 * User 2 ==> Your Friend (Buddy)
 *
 * Case 1 :: User 1 make a req to User 2  => User 1 and User 2 both move into requested_friend with their respective status
 * Case 2 :: User 2 accept the req of User 2 => User 1 and User 2 both move to friend_ids and removed from requested_friends
 * Case 3 :: User 2 reject the req of User 2 => User 1 and User 2 both move to blocked user with their respective status and removed from requested_friend
 * Case 4 :: User 1 blocked the User 2 => User 1 and User 2 both move to blocked user with their respective status and removed from friend_ids
 * Case 5 :: User 1 unblock the User 2 => User 1 and User 2 both removed from the blocked user
 */

const UsersModel = dbConnection.model("users", UserSchema);
export default UsersModel;
