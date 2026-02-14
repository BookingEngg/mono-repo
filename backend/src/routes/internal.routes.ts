// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Middleware
import AuthMiddleware from "@/middleware/auth.middleware";
// Controllers
import UserController from "@/controllers/user.controllers";
import CommunicationController from "@/controllers/communication.controllers";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";

class InternalRoutes implements Routes {
  public path = "/api/v1/internal";
  public router = Router();

  // Auth Middleware
  private authMiddleware = new AuthMiddleware();

  // Controllers
  private communicationController = new CommunicationController();
  private userController = new UserController();

  constructor() {
    this.initializeUserRoutes(`${this.path}/user`);
    this.initializeCommunicationRoutes(`${this.path}/communication`);
  }

  private initializeUserRoutes(prefix: string) {
    this.router.get(
      `${prefix}/`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.userController.getUsers)
    );
  }

  private initializeCommunicationRoutes(prefix: string) {
    this.router.post(
      `${prefix}/new-message`,
      asyncWrapper(this.communicationController.addNewChat)
    );
  }
}

export default InternalRoutes;
