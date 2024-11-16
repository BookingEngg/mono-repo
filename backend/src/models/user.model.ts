import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@database";

const dbConnection = MONGO_INSTANCES.praman;

const UserSchema = new Schema(
  {
    first_name: { type: String, require: true },
    last_name: { type: String },
    contact_number: { type: String, require: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const UsersModel = dbConnection.model("Users", UserSchema);
export default UsersModel;
