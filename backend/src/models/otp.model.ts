import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { IOtp } from "@/interfaces/user.interface";

const dbConnection = MONGO_INSTANCES.praman;

const OtpSchema: Schema<IOtp> = new Schema(
  {
    email: { type: String, require: true },
    user_id: { type: String, require: true },
    otp: { type: Number, require: true },
    is_verified: { type: Boolean, default: false },
    otp_response: { type: Object },
  },
  {
    timestamps: true,
  }
);

const OtpModel = dbConnection.model("otps", OtpSchema);
export default OtpModel;
