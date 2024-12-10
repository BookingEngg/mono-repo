import { IOtp } from "@/interfaces/user.interface";
import OtpModel from "@/models/otp.model";

class OtpDao {
  private otpModel = OtpModel;

  public getOtpDetailByEmail = async (email: string): Promise<IOtp> => {
    return await this.otpModel.findOne({ email }).sort({ createdAt: -1 });
  };

  public createOtp = async (payload: {
    email: string;
    otp: number;
    otp_response: object;
  }) => {
    return await this.otpModel.create(payload);
  };

  public markOtpAsVerified = async (payload: {
    id: string;
    user_id: string;
  }) => {
    const { id, user_id } = payload;
    return await this.otpModel.updateOne(
      {
        _id: id,
      },
      {
        user_id,
        is_verified: true,
      }
    );
  };
}

export default OtpDao;
