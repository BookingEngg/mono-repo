import { Routes } from "@interfaces/common.interface";
import { Router } from "express";
import UserController from "@/controllers/user.controllers";
import OtpController from "@/controllers/otp.controllers";
import CommunicationController from "@/controllers/communication.controllers";
import CommunityControllers from "@/controllers/community.controllers";
import AuthMiddleware from "@/middleware/auth.middleware";
import { asyncWrapper } from "@/middleware/common.middleware";

class ExternalRoutes implements Routes {
  public path = "/api/v1/platform";
  public router = Router();

  private authMiddleware = new AuthMiddleware();

  // Controllers
  private userController = new UserController();
  private otpController = new OtpController();
  private communicationController = new CommunicationController();
  private communityController = new CommunityControllers();

  constructor() {
    this.initializeUsersRoutes(`${this.path}/user`);
    this.initializeOtpRoutes(`${this.path}/otp`);
    this.initializeCommunicationRoutes(`${this.path}/comm`);
    this.initializeCommunityRoutes(`${this.path}/community`);
  }

  private initializeUsersRoutes(prefix: string) {
    this.router.get(
      `${prefix}/`,
      this.authMiddleware.getAuthUser,
      // this.authMiddleware.checkRoles([Roles.DIRECTOR]),
      asyncWrapper(this.userController.getUsers)
    );
    this.router.post(
      `${prefix}/create`,
      asyncWrapper(this.userController.createUser)
    );
    this.router.post(
      `${prefix}/logout`,
      asyncWrapper(this.userController.logoutAuthUser)
    );
  }

  private initializeOtpRoutes(prefix: string) {
    this.router.post(
      `${prefix}/create`,
      asyncWrapper(this.otpController.sendOtp)
    );
    this.router.post(
      `${prefix}/verify`,
      asyncWrapper(this.otpController.verifyOtp)
    );
  }

  private initializeCommunicationRoutes(prefix: string) {
    this.router.get(
      `${prefix}/chat-users`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communicationController.getCommunicationChatUsers)
    );

    this.router.get(
      `${prefix}/chat`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communicationController.getUserChats)
    );

    this.router.post(
      `${prefix}/new-chat`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communicationController.addNewChat)
    );
  }

  private initializeCommunityRoutes(prefix: string) {
    this.router.get(
      `${prefix}/:tab_name`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communityController.getCommunityUsers)
    );

    this.router.put(
      `${prefix}/friend/request`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communityController.makeFriendRequest)
    )

    this.router.put(
      `${prefix}/friend/request-status`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communityController.updateFriendRequestStatus)
    )

    this.router.put(
      `${prefix}/friend/unblock`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communityController.unblockUserStatus)
    )
  }
}

export default ExternalRoutes;
