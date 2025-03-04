// Modules
import { Request, Response } from "express";
// Services
import CommunicationService from "@/services/communication.service";

class CommunityControllers {
  // Services
  private communicationService = new CommunicationService();

  public getCommunityUsers = async (req: Request, res: Response) => {
    if (!req.user?._id) {
      throw new Error("Invalid User");
    }

    const { page_no, limit } = req.query;
    const tabName = req.params.tab_name as
      | "new-users"
      | "friends"
      | "blocked-users";

    const response = await this.communicationService.getCommunityUsers({
      user: req.user,
      pagination: {
        page: Number(page_no),
        limit: Number(limit),
      },
      tab: tabName || "new-users",
    });

    return res.send(response);
  };

  public makeFriendRequest = async (req: Request, res: Response) => {
    if (!req.user?._id) {
      throw new Error("Invalid User");
    }
    const { friend_id } = req.body;
    await this.communicationService.makeFriendRequest(req.user, friend_id);

    return res.send({ status: "success" });
  };

  public updateFriendRequestStatus = async (req: Request, res: Response) => {
    if (!req.user?._id) {
      throw new Error("Invalid User");
    }
    const { friend_id, request_status: requestStatus } = req.body;
    await this.communicationService.updateFriendRequestStatus({
      user: req.user,
      friendId: friend_id,
      requestStatus,
    });

    return res.send({ status: "success" });
  };

  public unblockUserStatus = async (req: Request, res: Response) => {
    if (!req.user?._id) {
      throw new Error("Invalid User");
    }

    const { friend_id } = req.body;
    await this.communicationService.unblockUserStatus({
      user: req.user,
      friendId: friend_id,
    });

    return res.send({ status: "success" });
  };
}

export default CommunityControllers;
