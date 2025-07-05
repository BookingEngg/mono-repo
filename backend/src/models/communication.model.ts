import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { ICommunication } from "@/interfaces/communication.interface";
import { CommunicationType } from "@/interfaces/enum";

const dbConnection = MONGO_INSTANCES.praman;

const CommunicationSchema: Schema<ICommunication> = new Schema(
  {
    message_type: { type: String, enum: CommunicationType, required: true }, // Message type group or private
    group_id: { type: String }, // group id of group msg (CommunicationGroup => short_id)
    sender_user_id: { type: String }, // sender id of direct msg
    receiver_user_id: { type: String }, // receiver id of direct msg
    message: { type: String, required: true }, // message content

    // Communication Meta
    is_edited: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

const CommunicationModel = dbConnection.model(
  "communication",
  CommunicationSchema
);
export default CommunicationModel;
