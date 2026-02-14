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
   * Create a new group entry in group DB
   */
  public createGroup = async (req: Request, res: Response): Promise<any> => {
    const user = req.user;
    if (!user._id) {
      throw new Error("Invalid User");
    }
    await this.communicationService.createGroup(user, req.body);
    return res.send({ status: "success" });
  };

  /**
   * Update the group details from the short_id
   */
  public updateGroupDetails = async (
    req: Request<{ shortId: string }>,
    res: Response
  ): Promise<any> => {
    const shortId = req.params.shortId;
    if (!shortId) {
      throw new Error("Group Id is required");
    }
    await this.communicationService.updateGroupDetails(shortId, req.body);
    return res.send({ status: "success" });
  };

  /**
   * Create a new message entry in communication db
   */
  public addNewChat = async (req: Request, res: Response): Promise<any> => {
    const {
      sender_id,
      receiver_id,
      group_id,
      message,
      type: messageType,
    } = req.body;

    await this.communicationService.createNewChatMessage({
      senderId: sender_id,
      receiverId: receiver_id,
      groupShortId: group_id,
      message,
      messageType,
    });

    return res.send({ status: "success" });
  };

  /**
   * Get the list of communication groups
   */
  public getGroupList = async (
    req: Request<{}, {}, { page_no: string; page_size: string }>,
    res: Response
  ): Promise<any> => {
    const user = req.user;
    if (!user._id) {
      throw new Error("Invalid User");
    }
    const { page_no, page_size } = req.query;

    const pageNo = Number(page_no || "1");
    const pageSize = Number(page_size || "10");
    const response = await this.communicationService.getGroupsList(
      user,
      pageNo,
      pageSize
    );
    return res.send({ status: "success", data: response });
  };

  /**
   * Get the message of a group listed on communication groups
   */
  public getGroupMessages = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const groupId: string = (req.query?.group_id || "") as string;
    if (!req.user?._id || !groupId) {
      throw new Error("Invalid User or Group id not found");
    }

    const response = await this.communicationService.getGroupMessages(
      req.user,
      groupId
    );

    return res.send({ status: "success", data: response });
  };

  /**
   * Get the group details from the groupid
   */
  public getGroupDetailsFromGroupId = async (
    req: Request<{ group_id: string }, {}, {}>,
    res: Response
  ): Promise<any> => {
    const groupId = req.params.group_id;
    if (!groupId) {
      throw new Error("Invalid Group id!");
    }

    const response = await this.communicationService.getGroupDetails(groupId);

    return res.send({ status: "success", data: response });
  };
}

export default CommunicationControllers;
