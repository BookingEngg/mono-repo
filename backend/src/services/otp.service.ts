import moment from "moment";
import OtpDao from "@/dao/otp.dao";
import generateOtp from "@/util/otp.util";
import { nodeMailConfig } from "@/config";
import MailTemplate from "@/util/mailtemplate.util";
import { IUser } from "@/interfaces/user.interface";
import UserDao from "@/dao/user.dao";
import { isProduction } from "@/config";
import { AccountStatusEnum, rolesEnum } from "@/interfaces/enum";

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
      let mailResponse = {};
      if (isProduction) {
        mailResponse = await this.mailTemplate.sendOtpTemplate(email, otp);
      }
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

    // For Development Purpose only :: This is not executed for prod
    if(!isProduction && otp.toString() === "0000") {
      isVerifiedOtp = true;
    }

    if (otpData) {
      const difference = moment().diff(moment(otpData.createdAt), "minutes");
      if (
        (otpData.otp == otp &&
          difference >= 0 &&
          difference <= nodeMailConfig.expire_in_minutes)
      ) {
        isVerifiedOtp = true;
      }
    }

    if (isVerifiedOtp) {
      userData = await this.userDao.getUserByEmail(email);

      if (userData && otpData) {
        await this.otpDao.markOtpAsVerified({
          id: otpData._id,
          user_id: userData._id,
        });
      }

      // Completes the brand onboarding email-verification step (and is a
      // harmless no-op for anyone already active/verified — e.g. an
      // influencer or a brand just using this as a return-login).
      if (
        userData &&
        (!userData.email_verified ||
          userData.account_status === AccountStatusEnum.ONBOARDING)
      ) {
        // Verifying an email no longer grants ACTIVE to a brand — paying the
        // security deposit is what does that (see PaymentService). A brand
        // moves to PENDING_DEPOSIT instead: signed in and able to reach the
        // deposit widget, but not yet able to post jobs. Anyone else has no
        // deposit to pay, so they go straight to ACTIVE.
        //
        // Only ever moves a brand FORWARD out of ONBOARDING: an already
        // ACTIVE brand using this as a return-login must not be demoted back
        // to PENDING_DEPOSIT and lose job posting.
        const isBrand = (userData.roles || []).includes(rolesEnum.BRAND);
        const nextStatus =
          isBrand && userData.account_status === AccountStatusEnum.ONBOARDING
            ? AccountStatusEnum.PENDING_DEPOSIT
            : userData.account_status === AccountStatusEnum.ONBOARDING
              ? AccountStatusEnum.ACTIVE
              : userData.account_status;

        await this.userDao.updateUserDetailsById(userData._id, {
          $set: {
            email_verified: true,
            account_status: nextStatus,
          },
        });
        userData = {
          ...userData,
          email_verified: true,
          account_status: nextStatus,
        };
      }
    }

    return userData;
  };
}

export default OtpService;
