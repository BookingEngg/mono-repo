import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { IRevplusLead } from "@/interfaces/user.interface";

const dbConnection = MONGO_INSTANCES.praman;

const leadHistorySchema = new Schema({
  user_agent: { type: String, require: true },
  ip_address: { type: String, require: true },
});

const RevplusLeadsSchema: Schema<IRevplusLead> = new Schema(
  {
    email: { type: String, require: true },
    is_verified: { type: Boolean, default: false },
    lead_history: { type: Array(leadHistorySchema), default: [] },
  },
  {
    timestamps: true,
  }
);

const RevplusLeadsModel = dbConnection.model(
  "revplusleads",
  RevplusLeadsSchema
);
export default RevplusLeadsModel;
