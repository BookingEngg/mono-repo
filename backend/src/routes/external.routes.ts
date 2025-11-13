// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers
import UserController from "@/controllers/user.controllers";
import AccessControlController from "@/controllers/accessControl.controllers";
import OtpController from "@/controllers/otp.controllers";
import CommunicationController from "@/controllers/communication.controllers";
import CommunityControllers from "@/controllers/community.controllers";
import OAuthController from "@/controllers/oAuth.controller";
import RevplusController from "@/controllers/revplus.controller";
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
  private accessControlController = new AccessControlController();
  private otpController = new OtpController();
  private communicationController = new CommunicationController();
  private communityController = new CommunityControllers();
  private oAuthController = new OAuthController();
  private revplusController = new RevplusController();

  constructor() {
    this.initializeUsersRoutes(`${this.path}/user`);
    this.initializeAccessControlRoutes(`${this.path}/access`);
    this.initializeOtpRoutes(`${this.path}/otp`);
    this.initializeCommunicationRoutes(`${this.path}/comm`);
    this.initializeCommunityRoutes(`${this.path}/community`);

    this.initializeOAuthAuthRoutes(`${this.path}/oauth`);
    this.initializeRevplusRoutes(`${this.path}`);
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

  private initializeAccessControlRoutes(prefix: string) {
    this.router.post(
      `${prefix}/`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.accessControlController.setUserRolesAndPrivilege)
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

    // Communication Groups Routes
    this.router.post(
      `${prefix}/group/new`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communicationController.createGroup)
    )

    this.router.get(
      `${prefix}/group/list`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communicationController.getGroupList)
    )

    this.router.get(
      `${prefix}/group/chats`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.communicationController.getGroupMessages)
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

  private initializeRevplusRoutes(prefix: string) {
    this.router.post(
      `${prefix}/leads`,
      asyncWrapper(this.revplusController.newLeadRequest)
    );
  }
}

export default ExternalRoutes;
