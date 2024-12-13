import { Routes } from "@interfaces/common.interface";
import { Roles } from "@/constants/common.constants";
import { Router } from "express";
import UserController from "@/controllers/user.controllers";
import OtpController from "@/controllers/otp.controllers";
import AuthMiddleware from "@/middleware/auth.middleware";

class ExternalRoutes implements Routes {
  public path = "/api/v1/platform";
  public router = Router();

  private authMiddleware = new AuthMiddleware();

  // Controllers
  private userController = new UserController();
  private otpController = new OtpController();

  constructor() {
    this.initializeUsersRoutes(`${this.path}/user`);
    this.initializeOtpRoutes(`${this.path}/otp`);
  }

  private initializeUsersRoutes(prefix: string) {
    this.router.get(
      `${prefix}/`,
      this.authMiddleware.getAuthUser(),
      this.authMiddleware.checkRoles([Roles.DIRECTOR]),
      this.userController.getUsers
    );
    this.router.post(`${prefix}/create`, this.userController.createUser);
  }

  private initializeOtpRoutes(prefix: string) {
    this.router.post(`${prefix}/create`, this.otpController.sendOtp);
    this.router.post(`${prefix}/verify`, this.otpController.verifyOtp);
  }
}

export default ExternalRoutes;
