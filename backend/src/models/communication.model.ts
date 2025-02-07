import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { ICommunication } from "@/interfaces/user.interface";

const dbConnection = MONGO_INSTANCES.praman;

const CommunicationSchema: Schema<ICommunication> = new Schema(
  {
    sender_user_id: { type: String, required: true },
    receiver_user_id: { type: String, required: true },
    message: { type: String, required: true },
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
