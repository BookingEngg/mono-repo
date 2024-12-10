import EMailService from "@/services/email.service";
import { nodeMailConfig } from "@/config";

class MailTemplate {
  private emailService = new EMailService();

  public sendOtpTemplate = async (senderEmail: string, otp: number) => {
    return await this.emailService.sendMail({
      senderEmail,
      mailTitle: "Login One Time Password",
      textString: "Otp",
      bodyHtml: `<p>Otp <strong>${otp}</strong> for next ${nodeMailConfig.expire_in_minutes} minutes</p>`,
    })
  }

}

export default MailTemplate;