import NodeMailer from "nodemailer";
import { nodeMailConfig } from "@/config";
import { IRequestMailPayload } from "@/interfaces/nodemailer.interface";

class EMailService {
  private nodeMailer = NodeMailer;

  private createTransport() {
    const { host, port, user, password } = nodeMailConfig;

    return this.nodeMailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: password,
      },
    });
  }

  public sendMail = async (payload: IRequestMailPayload) => {
    const { senderEmail, mailTitle, textString, bodyHtml } = payload;
    
    const transporter = this.createTransport();

    const mailResponse = await transporter.sendMail({
      from: nodeMailConfig.user,
      to: senderEmail,
      subject: mailTitle,
      text: textString,
      html: bodyHtml,
    });

    return mailResponse;
  };
}

export default EMailService;
