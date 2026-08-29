// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers
import HomeControllers from "@/controllers/home.controllers";
// Middlewares
import AuthMiddleware from "@/middleware/auth.middleware";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";

class HomeRoutes implements Routes {
  public path = "/api/v1/platform/home";
  public router = Router();

  private authMiddleware = new AuthMiddleware();
  private homeController = new HomeControllers();

  constructor() {
    this.initializeHomeRoutes(this.path);
  }

  private initializeHomeRoutes(prefix: string) {
    // No checkRoles: this endpoint serves every signed-in account and varies
    // its own response by role. Gating it to one role would just make the
    // other role's home screen a 403.
    this.router.get(
      `${prefix}/widgets`,
      this.authMiddleware.getAuthUser,
      asyncWrapper(this.homeController.getHomeWidgets),
    );
  }
}

export default HomeRoutes;
