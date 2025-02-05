import moment from "moment";
import OtpDao from "@/dao/otp.dao";
import generateOtp from "@/util/otp.util";
import { nodeMailConfig } from "@/config";
import MailTemplate from "@/util/mailtemplate.util";
import { IUser } from "@/interfaces/user.interface";
import UserDao from "@/dao/user.dao";

class OtpService {
  private otpDao = new OtpDao();
  private userDao = new UserDao();
  private mailTemplate = new MailTemplate();

  /**
   * Send an email if not send with in the limit defined in config
   * @param email
   */
  public generateNewOtp = async (email: string) => {
    const otpData = await this.otpDao.getOtpDetailByEmail(email);
    let isGenerateNewOtp = false;

    if (!otpData) isGenerateNewOtp = true;
    else {
      const difference = moment().diff(moment(otpData.createdAt), "minutes");
      if (difference > nodeMailConfig.expire_in_minutes) {
        isGenerateNewOtp = true;
      }
    }

    if (isGenerateNewOtp) {
      const otp = generateOtp();
      const mailResponse = await this.mailTemplate.sendOtpTemplate(email, otp);
      await this.otpDao.createOtp({
        email,
        otp,
        otp_response: mailResponse,
      });
    }
  };

  public getVerifiedUser = async (email: string, otp: number) => {
    const otpData = await this.otpDao.getOtpDetailByEmail(email);
    let userData: IUser | null = null;
    let isVerifiedOtp = false;

    if (otpData) {
      const difference = moment().diff(moment(otpData.createdAt), "minutes");
      if (
        otpData.otp == otp &&
        difference >= 0 &&
        difference <= nodeMailConfig.expire_in_minutes
      ) {
        isVerifiedOtp = true;
      }
    }

    if (isVerifiedOtp) {
      userData = await this.userDao.getUserByEmail(email);
      await this.otpDao.markOtpAsVerified({
        id: otpData._id,
        user_id: userData._id,
      });
    }

    return userData;
  };
}

export default OtpService;
