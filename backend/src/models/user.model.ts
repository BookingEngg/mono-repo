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
  },
  { timestamps: true }
);

const UsersModel = dbConnection.model("users", UserSchema);
export default UsersModel;
