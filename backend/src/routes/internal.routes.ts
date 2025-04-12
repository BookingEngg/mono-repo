// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers
import CommunicationController from "@/controllers/communication.controllers";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";

class InternalRoutes implements Routes {
  public path = "/api/v1/internal";
  public router = Router();

  // Controllers
  private communicationController = new CommunicationController();

  constructor() {
    this.initializeGoogleAuthRoutes(`${this.path}/communication`);
  }

  private initializeGoogleAuthRoutes(prefix: string) {
    this.router.put(
      `${prefix}/create`,
      asyncWrapper(this.communicationController.addNewChat)
    )
  }
}

export default InternalRoutes;
