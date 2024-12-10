import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@database";

const dbConnection = MONGO_INSTANCES.praman;

const PERMISSIONS = ["create_user"];

const UserPermissions = new Schema(
  {
    user_id: { type: String, require: true }, // permission applied on
    type: { type: Array(String), enum: PERMISSIONS, require: true },
    applied_user_id: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const UserPermissionsModel = dbConnection.model(
  "userpermissions",
  UserPermissions
);
export default UserPermissionsModel;
