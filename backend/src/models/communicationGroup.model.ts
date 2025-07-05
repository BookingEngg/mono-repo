import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { ICommunicationGroup } from "@/interfaces/communication.interface";
import { GroupType } from "@/interfaces/enum";

const dbConnection = MONGO_INSTANCES.praman;

const CommunicationGroupSchema: Schema<ICommunicationGroup> = new Schema(
  {
    short_id: { type: String, required: true },  // unique short id for group
    name: { type: String, required: true }, // group name
    description: { type: String }, // group description
    admin_id: { type: String, required: true }, // group admin user id
    group_member_ids: { type: Array(String), required: true }, // group members user ids
    group_type: { type: String, enum: GroupType, required: true }, // group type private or public
    group_profile_picture: { type: String }, // profile picture

    is_active: { type: Boolean, default: true }, // is group active in system (deleted or not)
    is_visible: { type: Boolean, default: false }, // is group visible in system (visible or not)
  },
  {
    timestamps: true,
  }
);

const CommunicationGroupModel = dbConnection.model(
  "communication-group",
  CommunicationGroupSchema
);
export default CommunicationGroupModel;
