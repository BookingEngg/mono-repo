import { Request, Response } from "express";
import UserService from "@/services/user.service";
import CommunicationService from "@/services/communication.service";

class CommunicationController {
  private userService = new UserService();
  private communicationService = new CommunicationService();

  public getUserChats = async (req: Request, res: Response): Promise<any> => {
    const receiverId: string = (req.query?.user_id || "") as string;
    if (!req.user?._id || !receiverId) {
      throw new Error("Invalid User");
    }

    const response = await this.communicationService.getUsersChat(
      req.user,
      receiverId
    );
    return res.send({ status: "success", data: response });
  };

  public getCommunicationChatUsers = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    if (!req.user?._id) {
      throw new Error("Invalid User");
    }

    const response = await this.userService.getChatUsers(req.user?.email);
    return res.send({ data: response });
  };

  /**
   * @deprecated
   */
  public addNewChat = async (req: Request, res: Response): Promise<any> => {
    if (!req.user?._id) {
      throw new Error("Invalid User");
    }
    const { user_id, message } = req.body;

    await this.communicationService.createChat({
      senderId: req.user._id.toString(),
      receiverId: user_id,
      message,
    });

    return res.send({ status: "success" });
  };
}

export default CommunicationController;
