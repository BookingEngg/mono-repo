import { Routes } from "@interfaces/common.interface";
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
  }

  private initializeUsersRoutes(prefix: string) {
    this.router.post(`${prefix}/otp/create`, this.otpController.sendOtp);
    this.router.post(`${prefix}/otp/verify`, this.otpController.verifyOtp);

    this.router.post(`${prefix}/create`, this.userController.createUser);
  }
}

export default ExternalRoutes;
