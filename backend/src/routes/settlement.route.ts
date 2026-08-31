// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers
import SettlementControllers from "@/controllers/settlement.controllers";
// Middlewares
import AuthMiddleware from "@/middleware/auth.middleware";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";
import { privilegesEnum, rolesEnum } from "@/interfaces/enum";

/**
 * A brand's settlement position, per creator:
 *
 *   GET /settlement/creator  → per creator who earned from them
 *
 * Settlement is per creator rather than per job because a brand pays a
 * person, not a campaign — one creator earning across three jobs should be
 * one payout, not three.
 */
class SettlementRoutes implements Routes {
  public path = "/api/v1/platform/settlement";
  public router = Router();

  private authMiddleware = new AuthMiddleware();
  private settlementController = new SettlementControllers();

  constructor() {
    this.initializeSettlementRoutes(this.path);
  }

  private initializeSettlementRoutes(prefix: string) {
    // Brand-only: these report money the brand owes, scoped server-side to
    // their own seller_id so one brand can never read another's position.
    // No requireActiveAccount — a brand mid-onboarding still has a right to
    // see what it owes; that gate is about creating new obligations.
    this.router.get(
      `${prefix}/creator`,
      this.authMiddleware.getAuthUser,
      this.authMiddleware.checkRoles(
        [rolesEnum.BRAND],
        [privilegesEnum.CREATE_JOBS],
      ),
      asyncWrapper(this.settlementController.getSettlementByCreator),
    );
  }
}

export default SettlementRoutes;
