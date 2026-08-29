import { Request, Response } from "express";
import PaymentService from "@/services/payment.service";
import { getGateway } from "@/services/paymentGateway.service";
import { PaymentProviderEnum } from "@/interfaces/enum";
import { ICheckoutQuery } from "@/validators/payment.validator";

class PaymentControllers {
  private paymentService = new PaymentService();

  /**
   * STEP 1 — what the customer is about to pay, before anything is created.
   */
  public getCheckoutDetails = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user) {
      throw new Error("User not found");
    }

    const data = await this.paymentService.getCheckoutDetails(
      req.user,
      req.query as unknown as ICheckoutQuery,
    );
    return res.send({ status: "success", data });
  };

  /**
   * STEP 2 — opens the gateway order and returns the SDK payload.
   */
  public initiatePayment = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user) {
      throw new Error("User not found");
    }

    const data = await this.paymentService.initiatePayment(req.user, req.body);
    return res.send({ status: "success", data });
  };

  /**
   * STEP 3 — called after the SDK closes, whatever the reason. Polls the
   * gateway for the real outcome and settles our row against it.
   */
  public verifyPayment = async (req: Request, res: Response): Promise<any> => {
    if (!req.user) {
      throw new Error("User not found");
    }

    const data = await this.paymentService.verifyPayment(req.user, req.body);
    return res.send({ status: "success", data });
  };

  /**
   * Gateway-to-server callback. Unauthenticated by design — the HMAC over the
   * raw body is the authentication, which is why express.json's `verify` hook
   * stashes rawBody (a re-serialized body would not reproduce the signature).
   */
  public handleWebhook = async (req: Request, res: Response): Promise<any> => {
    const provider = (
      req.params.provider || ""
    ).toUpperCase() as PaymentProviderEnum;

    // Each gateway names its signature header differently, so the adapter
    // tells us which one to read rather than the controller hardcoding one.
    const gateway = getGateway(provider);
    const signature = req.headers[gateway.webhookSignatureHeader] as string;

    const result = await this.paymentService.handleGatewayWebhook({
      provider,
      rawBody: req.rawBody || "",
      signature,
      body: req.body,
    });

    return res.send({ status: "success", ...result });
  };
}

export default PaymentControllers;
