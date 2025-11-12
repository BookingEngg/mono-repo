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
    this.initializeCommunicationRoutes(`${this.path}/communication`);
  }

  private initializeCommunicationRoutes(prefix: string) {
    this.router.post(
      `${prefix}/new-message`,
      asyncWrapper(this.communicationController.addNewChat)
    );
  }
}

export default InternalRoutes;
