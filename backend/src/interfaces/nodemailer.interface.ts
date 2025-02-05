
export interface IRequestMailPayload {
  senderEmail: string;
  mailTitle: string;
  textString: string;
  bodyHtml: string;
}