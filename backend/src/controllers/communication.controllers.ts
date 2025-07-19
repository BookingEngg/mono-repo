import { Request, Response } from "express";
import UserService from "@/services/user.service";
import CommunicationService from "@/services/communication.service";

class CommunicationControllers {
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

  public getMessages = async (req: Request, res: Response): Promise<any> => {
    const receiverId: string = (req.query?.user_id || "") as string;
    if (!req.user?._id || !receiverId) {
      throw new Error("Invalid User");
    }

    const response = await this.communicationService.getDirectMessages(
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

    const response = await this.userService.getChatUsers(req.user);
    return res.send({ data: response });
  };

  /**
   * Create a new message entry in communication db
   */
  public addNewChat = async (req: Request, res: Response): Promise<any> => {
    const { sender_id, receiver_id, message, type: messageType } = req.body;

    await this.communicationService.createNewChatMessage({
      senderId: sender_id,
      receiverId: receiver_id,
      message,
      messageType,
    });

    return res.send({ status: "success" });
  };

}

export default CommunicationControllers;
