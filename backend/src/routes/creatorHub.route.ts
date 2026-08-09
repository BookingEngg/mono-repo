// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers
import CreatorHubControllers from "@/controllers/creatorHub.controllers";

// Middlewares
import AuthMiddleware from "@/middleware/auth.middleware";
import ValidatorMiddleware from "@/middleware/validator.middleware";
// Validators
import {
  createJobSchema,
  applyForJobSchema,
  resolveLinkParamsSchema,
} from "@/validators/creatorHub.validator";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";

class CreatorHubRoutes implements Routes {
  public path = "/api/v1/platform/creator";
  public router = Router();

  private authMiddleware = new AuthMiddleware();
  private validatorMiddleware = new ValidatorMiddleware();
  private creatorHubController = new CreatorHubControllers();

  constructor() {
    this.router.get(
      `${this.path}/post/:shortId`,
      this.validatorMiddleware.validateRequestParams(resolveLinkParamsSchema),
      this.creatorHubController.redirectLink
    );

    this.initializeJobRoutes(`${this.path}/job`);
    this.initializeJobApplicationRoutes(`${this.path}/job-application`);
  }


  private initializeJobRoutes (prefix: string) {
    this.router.post(
      `${prefix}`,
      this.authMiddleware.getAuthUser,
      this.validatorMiddleware.validateRequestBody(createJobSchema),
      asyncWrapper(this.creatorHubController.createJob)
    );
  }

  private initializeJobApplicationRoutes (prefix: string) {
    this.router.post(
      `${prefix}`,
      this.authMiddleware.getAuthUser,
      this.validatorMiddleware.validateRequestBody(applyForJobSchema),
      asyncWrapper(this.creatorHubController.applyForJob)
    );
  }
}

export default CreatorHubRoutes;
