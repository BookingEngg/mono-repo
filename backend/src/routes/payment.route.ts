// Modules
import { Router } from "express";
// Interface
import { Routes } from "@interfaces/common.interface";
// Controllers
import PaymentControllers from "@/controllers/payment.controllers";
// Middlewares
import AuthMiddleware from "@/middleware/auth.middleware";
import ValidatorMiddleware from "@/middleware/validator.middleware";
// Validators
import {
  checkoutQuerySchema,
  initiatePaymentSchema,
  verifyPaymentSchema,
} from "@/validators/payment.validator";
// Wrappers
import { asyncWrapper } from "@/middleware/common.middleware";

/**
 * The three calls run in sequence for every payment:
 *
 *   GET  /checkout          → what you're about to pay (read-only)
 *   POST /initiate-payment  → open the order, get the SDK payload
 *   POST /verify-payment    → after the SDK closes, poll the gateway and settle
 *
 * The webhook underneath is not part of that sequence — it's the safety net
 * for a customer who never comes back to the browser at all.
 */
class PaymentRoutes implements Routes {
  public path = "/api/v1/platform";
  // Webhooks are gateway-to-server, not browser-to-server: they carry no
  // cookie and authenticate by HMAC instead, so they live off the
  // authenticated platform prefix.
  public internalPath = "/api/v1/internal/payment";
  public router = Router();

  private authMiddleware = new AuthMiddleware();
  private validatorMiddleware = new ValidatorMiddleware();
  private paymentController = new PaymentControllers();

  constructor() {
    this.initializeCheckoutRoutes(`${this.path}/checkout`);
    this.initializePaymentRoutes(`${this.path}/payment`);
    this.initializeWebhookRoutes(this.internalPath);
  }

  private initializeCheckoutRoutes (prefix: string) {
    this.router.get(
      `${prefix}/`,
      this.authMiddleware.getAuthUser,
      this.validatorMiddleware.validateRequestQuery(checkoutQuerySchema),
      asyncWrapper(this.paymentController.getCheckoutDetails),
    );
  }

  private initializePaymentRoutes(prefix: string) {
    this.router.post(
      `${prefix}/initiate-payment`,
      this.authMiddleware.getAuthUser,
      this.validatorMiddleware.validateRequestBody(initiatePaymentSchema),
      asyncWrapper(this.paymentController.initiatePayment),
    );

    this.router.post(
      `${prefix}/verify-payment`,
      this.authMiddleware.getAuthUser,
      this.validatorMiddleware.validateRequestBody(verifyPaymentSchema),
      asyncWrapper(this.paymentController.verifyPayment),
    );
  }

  private initializeWebhookRoutes(prefix: string) {
    this.router.post(
      `${prefix}/webhook/:provider`,
      asyncWrapper(this.paymentController.handleWebhook),
    );
  }
}

export default PaymentRoutes;
