import { PaymentProviderEnum, PaymentStatusEnum, PaymentTypeEnum } from "./enum";

// A brand's payment against a Creator Hub billing cycle — per the flow in
// backend/src/models/creator_hub.txt: creators accrue earnings, the brand is
// periodically billed creator_earnings_total + platform_fee, and pays that
// total in one shot. This row holds everything about that one payment; the
// per-payee fan-out (Creator A, Creator B, platform) that follows a
// successful payment is a separate concern, not modeled here.
export interface IPayment {
  id?: number;

  seller_id?: string;
  order_id: string;
  user_id?: string;
  payable_amount: number;
  currency: string;
  transaction_id?: string; // partner order id

  online_request?: object;
  online_response?: object;

  payment_type: PaymentTypeEnum;
  payment_status: PaymentStatusEnum;
  payment_gateway: PaymentProviderEnum;
  payment_cycle_id?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * What the gateway hands back when an order is opened on its side. `raw` is
 * persisted verbatim into payments.online_request so a support question about
 * any payment can be answered from our own DB without calling the gateway.
 */
export interface IGatewayOrder {
  gateway_order_id: string;
  raw: Record<string, unknown>;
}

export interface ICreateGatewayOrderInput {
  // Major currency units (rupees, not paise). Each gateway converts to
  // whatever unit it wants at its own boundary — callers never deal in paise.
  amount: number;
  currency: string;
  receipt: string; // our own payments.order_id, echoed back by the gateway
  notes?: Record<string, string>;
}

/**
 * Normalized view of a gateway webhook, so the service layer can act on a
 * payment outcome without knowing any gateway's event vocabulary.
 */
export interface IGatewayWebhookEvent {
  gateway_order_id?: string;
  gateway_payment_id?: string;
  status: PaymentStatusEnum;
}

/**
 * Result of asking the gateway what actually happened to an order.
 *
 * `status: null` means "nothing decisive yet" — the order exists but carries
 * no payment attempt, or only a still-open one. That is deliberately NOT the
 * same as failed: a caller must leave the row untouched rather than closing
 * out a payment the customer may still be completing.
 */
export interface IGatewayPaymentStatus {
  status: PaymentStatusEnum | null;
  gateway_payment_id?: string;
  raw: Record<string, unknown>;
}

/**
 * One line of the pre-payment summary. Amounts are major units.
 */
export interface IPaymentLineItem {
  label: string;
  amount: number;
}

export interface IPaymentCheckoutDetails {
  payment_type: PaymentTypeEnum;
  title: string;
  description?: string;
  line_items: IPaymentLineItem[];
  total: number;
  currency: string;
}

/**
 * The port every payment gateway implements. This is the ONLY seam a new
 * gateway has to satisfy: add an implementation, add a PaymentProviderEnum
 * value, register it — no changes to the service, controller, or UI.
 */
export interface IPaymentGateway {
  provider: PaymentProviderEnum;

  /** Request header this gateway puts its webhook signature in. */
  webhookSignatureHeader: string;

  /** Public merchant identifier, safe to hand to the browser. */
  getPublicKey(): string;

  createOrder(input: ICreateGatewayOrderInput): Promise<IGatewayOrder>;

  /**
   * Asks the gateway, server to server, what actually became of an order.
   *
   * This is what makes verification trustworthy: it needs nothing from the
   * browser, so it still gives the right answer when the SDK is dismissed
   * without a handshake, the tab is closed, or the callback never fires.
   */
  fetchOrderPaymentStatus(gatewayOrderId: string): Promise<IGatewayPaymentStatus>;

  /**
   * Verifies the signed handshake the browser returns after checkout. Returns
   * false (never throws) on anything unverifiable, so callers can treat a bad
   * signature and a forged payload identically.
   */
  verifyPaymentSignature(payload: Record<string, string>): boolean;

  /** Verifies a webhook against the RAW request body — a re-serialized body will not match. */
  verifyWebhookSignature(rawBody: string, signature: string): boolean;

  parseWebhookEvent(body: Record<string, any>): IGatewayWebhookEvent | null;
}
