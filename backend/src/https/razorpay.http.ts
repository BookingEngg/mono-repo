import crypto from "crypto";
import { fetch } from "@/util/utils.util";
import { paymentConfig } from "@/config";
import { PaymentProviderEnum, PaymentStatusEnum } from "@/interfaces/enum";
import {
  ICreateGatewayOrderInput,
  IGatewayOrder,
  IGatewayPaymentStatus,
  IGatewayWebhookEvent,
  IPaymentGateway,
  IRouteAccount,
  IRouteProduct,
  IRouteStakeholder,
} from "@/interfaces/payment.interface";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

// Accounts, stakeholders and products live on v2 — the same host and the same
// Basic auth, but a different version prefix from the payments API above.
const RAZORPAY_API_V2_BASE = "https://api.razorpay.com/v2";

/**
 * Razorpay adapter built on its plain REST API — deliberately no `razorpay`
 * npm package. Everything the SDK would do here is a signed HTTP call plus an
 * HMAC check, both of which node-fetch and node's built-in `crypto` already
 * cover, so the dependency would buy nothing and add a supply-chain surface to
 * the one part of the app that touches money.
 *
 * This is the only file in the backend that knows Razorpay's wire format.
 */
class RazorpayHttp implements IPaymentGateway {
  public provider = PaymentProviderEnum.RAZORPAY;
  public webhookSignatureHeader = "x-razorpay-signature";

  private get credentials() {
    return paymentConfig.razorpay;
  }

  public getPublicKey = () => this.credentials.key_id;

  private getAuthHeader = () => {
    const { key_id, key_secret } = this.credentials;
    const encoded = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
    return `Basic ${encoded}`;
  };

  /**
   * Razorpay bills in the smallest currency unit (paise), we store and reason
   * in rupees. Rounding here rather than truncating avoids a float artifact
   * like 899.99999 silently becoming ₹8.99 short.
   */
  private toMinorUnit = (amount: number) => Math.round(amount * 100);

  public createOrder = async (
    input: ICreateGatewayOrderInput,
  ): Promise<IGatewayOrder> => {
    const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: this.toMinorUnit(input.amount),
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes,
      }),
    });

    const body = (await response.json()) as Record<string, any>;

    if (!response.ok || !body?.id) {
      // Razorpay nests the human-readable reason; surface it so a
      // misconfigured key or a rejected amount is debuggable from our logs.
      const reason = body?.error?.description || "Could not create the order";
      throw new Error(`Razorpay: ${reason}`);
    }

    return { gateway_order_id: body.id, raw: body };
  };

  /**
   * Razorpay has no single "order status" field that reflects the money, so
   * the authoritative answer is the payment attempts made against the order.
   * An order can accumulate several (a failed card, then a successful UPI),
   * hence the precedence walk rather than reading items[0].
   */
  public fetchOrderPaymentStatus = async (
    gatewayOrderId: string,
  ): Promise<IGatewayPaymentStatus> => {
    const response = await fetch(
      `${RAZORPAY_API_BASE}/orders/${gatewayOrderId}/payments`,
      {
        method: "GET",
        headers: { Authorization: this.getAuthHeader() },
      },
    );

    const body = (await response.json()) as Record<string, any>;

    if (!response.ok) {
      const reason =
        body?.error?.description || "Could not read the payment status";
      throw new Error(`Razorpay: ${reason}`);
    }

    const attempts: Record<string, any>[] = body?.items || [];

    // Precedence matters: one captured attempt means the customer paid, even
    // if three earlier attempts failed. Only conclude "failed" when nothing
    // succeeded and nothing is still open.
    const captured = attempts.find(
      (attempt) =>
        attempt?.status === "captured" || attempt?.status === "refunded",
    );
    if (captured) {
      return {
        status: PaymentStatusEnum.SUCCESS,
        gateway_payment_id: captured.id,
        raw: body,
      };
    }

    // Authorized = the bank is holding the funds but they aren't captured
    // yet. Not terminal — reporting failure here would strand real money.
    const authorized = attempts.find(
      (attempt) => attempt?.status === "authorized",
    );
    if (authorized) {
      return {
        status: PaymentStatusEnum.PENDING,
        gateway_payment_id: authorized.id,
        raw: body,
      };
    }

    const failed = attempts.find((attempt) => attempt?.status === "failed");
    if (failed) {
      return {
        status: PaymentStatusEnum.FAILED,
        gateway_payment_id: failed.id,
        raw: body,
      };
    }

    // No attempts at all: the customer opened checkout and walked away. The
    // order is still payable, so the caller must not close it out.
    return { status: null, raw: body };
  };

  /**
   * Constant-time compare so a signature check can't be narrowed byte-by-byte
   * by timing the response. Length mismatch is rejected up front because
   * timingSafeEqual throws on unequal buffer lengths.
   */
  private isSignatureValid = (expected: string, received: string) => {
    const expectedBuffer = Buffer.from(expected, "utf8");
    const receivedBuffer = Buffer.from(received || "", "utf8");

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  };

  private sign = (payload: string, secret: string) =>
    crypto.createHmac("sha256", secret).update(payload).digest("hex");

  public verifyPaymentSignature = (payload: Record<string, string>) => {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = payload || {};

    if (!orderId || !paymentId || !signature) {
      return false;
    }

    const expected = this.sign(
      `${orderId}|${paymentId}`,
      this.credentials.key_secret,
    );
    return this.isSignatureValid(expected, signature);
  };

  public verifyWebhookSignature = (rawBody: string, signature: string) => {
    if (!rawBody || !signature || !this.credentials.webhook_secret) {
      return false;
    }

    const expected = this.sign(rawBody, this.credentials.webhook_secret);
    return this.isSignatureValid(expected, signature);
  };

  public parseWebhookEvent = (
    body: Record<string, any>,
  ): IGatewayWebhookEvent | null => {
    const event = body?.event as string | undefined;
    const paymentEntity = body?.payload?.payment?.entity;
    const orderEntity = body?.payload?.order?.entity;

    // Only the terminal events matter — the intermediate ones (authorized,
    // order.created) would just churn the row back and forth.
    const statusByEvent: Record<string, PaymentStatusEnum> = {
      "payment.captured": PaymentStatusEnum.SUCCESS,
      "order.paid": PaymentStatusEnum.SUCCESS,
      "payment.failed": PaymentStatusEnum.FAILED,
    };

    const status = event ? statusByEvent[event] : undefined;
    if (!status) {
      return null;
    }

    return {
      gateway_order_id: paymentEntity?.order_id || orderEntity?.id,
      gateway_payment_id: paymentEntity?.id,
      status,
    };
  };

  // ---------------------------------------------------------------------
  // Route onboarding
  //
  // Four calls, in order, to give a creator a linked account Razorpay can
  // settle their earnings into:
  //   1. createLinkedAccount     POST   /v2/accounts
  //   2. createStakeholder       POST   /v2/accounts/:id/stakeholders
  //   3. requestRouteProduct     POST   /v2/accounts/:id/products
  //   4. configureRouteProduct   PATCH  /v2/accounts/:id/products/:productId
  //
  // Each is a separate call because each can fail on its own and Razorpay has
  // no transaction across them. The caller owns the sequencing and persists
  // the id each step returns, so a retry resumes rather than starting over.
  //
  // Each function issues its own request end to end, so one can be changed —
  // a different header, a retry, a version bump — without touching the other
  // three.
  //
  // These take an already-built body. Constructing it is razorpay.helper.ts's
  // job (createLinkedAccount and friends), which keeps this file to
  // signing, sending and reading the response.
  // ---------------------------------------------------------------------

  /**
   * 1. The creator's linked account. Returns its `acc_...` id.
   *
   * @param payload body from razorpay.helper's createLinkedAccount
   */
  public createLinkedAccount = async (
    payload: Record<string, any>,
  ): Promise<IRouteAccount> => {
    const response = await fetch(`${RAZORPAY_API_V2_BASE}/accounts`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as Record<string, any>;

    if (!response.ok || !body?.id) {
      // Razorpay names the offending field on validation failures, and
      // onboarding payloads are large — without the field a rejection is
      // near-impossible to place.
      const error = body?.error || {};
      const field = error.field ? ` (field: ${error.field})` : "";
      throw new Error(
        `Razorpay: ${error.description || "Could not create the linked account"}${field}`,
      );
    }

    return { id: body.id, raw: body };
  };

  /**
   * 2. The person behind the account, for KYC.
   *
   * @param payload body from buildStakeholderPayload
   */
  public createStakeholder = async (
    accountId: string,
    payload: Record<string, any>,
  ): Promise<IRouteStakeholder> => {
    const response = await fetch(
      `${RAZORPAY_API_V2_BASE}/accounts/${accountId}/stakeholders`,
      {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Record<string, any>;

    if (!response.ok || !body?.id) {
      const error = body?.error || {};
      const field = error.field ? ` (field: ${error.field})` : "";
      throw new Error(
        `Razorpay: ${error.description || "Could not create the stakeholder"}${field}`,
      );
    }

    return { id: body.id, raw: body };
  };

  /**
   * 3. Asks for the Route product on this account. Returns an `acc_prd_...`
   * id that step 4 configures; the product is not usable until then.
   *
   * @param payload body from razorpay.helper's createProduct
   */
  public requestRouteProduct = async (
    accountId: string,
    payload: Record<string, any>,
  ): Promise<IRouteProduct> => {
    const response = await fetch(
      `${RAZORPAY_API_V2_BASE}/accounts/${accountId}/products`,
      {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Record<string, any>;

    if (!response.ok || !body?.id) {
      const error = body?.error || {};
      const field = error.field ? ` (field: ${error.field})` : "";
      throw new Error(
        `Razorpay: ${error.description || "Could not request the route product"}${field}`,
      );
    }

    return {
      id: body.id,
      activation_status: body.activation_status,
      requirements: body.requirements,
      raw: body,
    };
  };

  /**
   * 4. Attaches the creator's bank account, which is what Razorpay actually
   * reviews.
   *
   * The response's `activation_status` is the answer to "can we pay them
   * yet": "activated" means settlements will go through, while "under_review"
   * / "needs_clarification" mean Razorpay is still checking — and
   * `requirements` lists what it is missing. Returned rather than interpreted
   * here, since what to do about each state is a business decision.
   *
   * @param payload body from razorpay.helper's configureProduct
   */
  public configureRouteProduct = async (
    accountId: string,
    productId: string,
    payload: Record<string, any>,
  ): Promise<IRouteProduct> => {
    const response = await fetch(
      `${RAZORPAY_API_V2_BASE}/accounts/${accountId}/products/${productId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Record<string, any>;
    if (!response.ok) {
      const error = body?.error || {};
      const field = error.field ? ` (field: ${error.field})` : "";
      throw new Error(
        `Razorpay: ${error.description || "Could not configure the route product"}${field}`,
      );
    }

    return {
      id: body.id || productId,
      activation_status: body.activation_status,
      requirements: body.requirements,
      raw: body,
    };
  };
}

export default RazorpayHttp;
