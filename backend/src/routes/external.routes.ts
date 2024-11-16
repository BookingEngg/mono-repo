import { Routes } from "@interfaces/common.interface";
import { Router } from "express";
import UserController from "@/controllers/user.controllers";

class ExternalRoutes implements Routes {
  public path = "/api/v1/platform";
  public router = Router();

  // Controllers
  private userController = new UserController();

  constructor() {
    this.initilizePostRoutes(`${this.path}/user`);
    this.initilizeGetRoutes(`${this.path}/users`);
  }

  private initilizeGetRoutes(prefix: string) {    
    this.router.get(`${prefix}/`, this.userController.getUsers);
  }

  private initilizePostRoutes(prefix: string) {
    this.router.post(`${prefix}/create`, this.userController.createUser);
  }
}

export default ExternalRoutes;
