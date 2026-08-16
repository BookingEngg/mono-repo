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
  recordConversionSchema,
} from "@/validators/creatorHub.validator";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";
import { privilegesEnum, rolesEnum } from "@/interfaces/enum";

class CreatorHubRoutes implements Routes {
  public path = "/api/v1/platform/creator";
  public internalPath = "/api/v1/internal/creator";
  public router = Router();

  private authMiddleware = new AuthMiddleware();
  private validatorMiddleware = new ValidatorMiddleware();
  private creatorHubController = new CreatorHubControllers();

  constructor() {
    this.router.get(
      `${this.path}/post/:shortId`,
      this.validatorMiddleware.validateRequestParams(resolveLinkParamsSchema),
      this.creatorHubController.redirectLink,
    );

    this.initializeJobRoutes(`${this.path}/job`);
    this.initializeJobApplicationRoutes(`${this.path}/job-application`);
    this.initializeConversionRoutes(`${this.internalPath}/conversion`);
  }

  private initializeJobRoutes(prefix: string) {
    this.router.post(
      `${prefix}`,
      this.authMiddleware.getAuthUser,
      this.authMiddleware.checkRoles(
        [rolesEnum.BRAND],
        [privilegesEnum.CREATE_JOBS],
      ),
      this.validatorMiddleware.validateRequestBody(createJobSchema),
      asyncWrapper(this.creatorHubController.createJob),
    );
  }

  private initializeJobApplicationRoutes(prefix: string) {
    this.router.post(
      `${prefix}`,
      this.authMiddleware.getAuthUser,
      this.authMiddleware.checkRoles(
        [rolesEnum.BRAND],
        [privilegesEnum.UPDATE_JOBS],
      ),
      this.validatorMiddleware.validateRequestBody(applyForJobSchema),
      asyncWrapper(this.creatorHubController.applyForJob),
    );
  }

  private initializeConversionRoutes(prefix: string) {
    this.router.post(
      `${prefix}`,
      this.validatorMiddleware.validateRequestBody(recordConversionSchema),
      asyncWrapper(this.creatorHubController.recordConversion),
    );
  }
}

export default CreatorHubRoutes;
