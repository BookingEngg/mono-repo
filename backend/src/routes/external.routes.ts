// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers
import UserController from "@/controllers/user.controllers";
import OtpController from "@/controllers/otp.controllers";
import CommunicationController from "@/controllers/communication.controllers";
import CommunityControllers from "@/controllers/community.controllers";
import OAuthController from "@/controllers/oAuth.controller";
import NotificationController from "@/controllers/pushNotification.controllers";
// Middlewares
import AuthMiddleware from "@/middleware/auth.middleware";
// Wrappers
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
  private oAuthController = new OAuthController();
  private notificationController = new NotificationController();

  constructor() {
    this.initializeUsersRoutes(`${this.path}/user`);
    this.initializeOtpRoutes(`${this.path}/otp`);
    this.initializeCommunicationRoutes(`${this.path}/comm`);
    this.initializeCommunityRoutes(`${this.path}/community`);

    this.initializeOAuthAuthRoutes(`${this.path}/oauth`);
    this.initializeNotificationRoutes(`${this.path}/notification`);
  }

  private initializeOAuthAuthRoutes(prefix: string) {
    this.router.get(
      `${prefix}/client-details`,
      asyncWrapper(this.oAuthController.getClientDetails)
    );

    this.router.get(
      `${prefix}/github_init`,
      asyncWrapper(this.oAuthController.initGithubOAuth)
    );

    this.router.get(
      `${prefix}/github-user`,
      asyncWrapper(this.oAuthController.getGithubOAuthUser)
    );

    this.router.post(
      `${prefix}/google-user`,
      asyncWrapper(this.oAuthController.getGoogleOAuthUser)
    );
  }

  private initializeUsersRoutes(prefix: string) {
    this.router.get(
      `${prefix}/`,
      this.authMiddleware.getAuthUser,
      // this.authMiddleware.checkRoles([Roles.DIRECTOR]),
      asyncWrapper(this.userController.getUsers)
    );
    this.router.post(
      `${prefix}/logout`,
      asyncWrapper(this.userController.logoutAuthUser)
    );

    this.router.get(
      `${prefix}/summary`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.userController.getDashboardSummary)
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

    this.router.get(
      `${prefix}/chat-v2`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communicationController.getMessages)
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
    );

    this.router.put(
      `${prefix}/friend/request-status`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communityController.updateFriendRequestStatus)
    );

    this.router.put(
      `${prefix}/friend/unblock`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communityController.unblockUserStatus)
    );
  }

  private initializeNotificationRoutes(prefix: string) {
    this.router.post(
      `${prefix}/subscribe`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.notificationController.userSubscribeNotification)
    );

    this.router.post(
      `${prefix}/publish`,
      // this.authMiddleware.getAuthUser,
      asyncWrapper(this.notificationController.publishNotificationSubscription)
    );
  }
}

export default ExternalRoutes;
