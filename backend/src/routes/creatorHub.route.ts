// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers

// Middlewares
import AuthMiddleware from "@/middleware/auth.middleware";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";

class CreatorHubRoutes implements Routes {
  public path = "/api/v1/platform/creator";
  public router = Router();

  private authMiddleware = new AuthMiddleware();

  constructor() {
    
  }
}

export default CreatorHubRoutes;
