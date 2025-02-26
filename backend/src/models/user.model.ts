import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@database";

const dbConnection = MONGO_INSTANCES.praman;

export const IOrigin = new Schema({
  country: String,
  state: String,
  zipcode: Number,
});

export const ROLES = ["director", "admin", "users"];

const UserSchema = new Schema(
  {
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    contact: { type: String, require: true },
    email: { type: String, require: true },
    roles: { type: Array(String), enum: ROLES, require: true }, // user, admin, director, etc.
    level: { type: Number, default: 1 }, // Level of the user
    origin: { type: IOrigin, default: undefined },
    email_verified: { type: Boolean, default: false },
    friends_ids: { type: Array(String), default: [] }, // Contain all the friends user id
    requested_friends_ids: { type: Array(String), default: [] }, // Contain all the unapproved user who request to make friend
    blocked_ids: { type: Array(String), default: [] }, // Contain all the blocked user id for the perticular user
  },
  { timestamps: true }
);

/**
 * CONDITIONS FOR USER FRIEND
 * User 1 ==> Current User
 * User 2 ==> Your Friend (Buddy)
 *
 * User 1 make request to User 2 :: User 1 id was in the friends_ids and User 2 id was in the requested_friends_ids
 *
 * User 2 approved request if User 1 requested
 * User 1 approved request if User 2 requested :: move ids from requested_friends_ids in the friends_ids
 *
 * User 1 or User 2 block each other if both of them are friends in such case :: both user id move from friends_ids to blocked_ids
 */

const UsersModel = dbConnection.model("users", UserSchema);
export default UsersModel;
