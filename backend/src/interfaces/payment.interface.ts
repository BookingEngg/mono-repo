import { PaymentProviderEnum, PaymentStatusEnum, PaymentTypeEnum } from "./enum";

// A brand's payment against a Creator Hub billing cycle — per the flow in
// backend/src/models/creator_hub.txt: creators accrue earnings, the brand is
// periodically billed creator_earnings_total + platform_fee, and pays that
// total in one shot. This row holds everything about that one payment; the
// per-payee fan-out (Creator A, Creator B, platform) that follows a
// successful payment is a separate concern, not modeled here.
/**
 * Nullable columns are typed `?: T | null` rather than `?: T` on purpose.
 * Both states are real and they mean different things: `undefined` is "not
 * supplied on create", while `null` is what Postgres actually hands back for
 * a column that was never set. Narrowing to `undefined` alone would make a
 * PaymentModel row unassignable to this interface and force a cast at every
 * call site — which would hide exactly the mismatches this type exists to
 * catch.
 */
export interface IPayment {
  id?: number;

  seller_id?: string | null;
  order_id: string;
  user_id?: string | null;
  payable_amount: number;
  currency: string;
  transaction_id?: string | null; // partner order id

  online_request?: object | null;
  /** Appended to per gateway exchange — never replaced. See the model. */
  online_response?: object[] | null;

  payment_type: PaymentTypeEnum;
  payment_status: PaymentStatusEnum;
  payment_gateway: PaymentProviderEnum;
  payment_cycle_id?: string | null;

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
  /**
   * Distinct jobs this line covers. Only settlement lines have one — a
   * security deposit isn't tied to any job — so it's optional rather than
   * forced to a meaningless zero.
   */
  job_count?: number;
  is_transfer_payment?: boolean;
  /**
   * The same figure, formatted for display ("₹8.12", "₹1,20,000").
   *
   * Sent alongside the raw number rather than instead of it: the client still
   * needs `amount` for any arithmetic, but formatting server-side means
   * grouping and decimals match everywhere the figure appears, and a client
   * can render it without knowing the currency's rules.
   */
  amount_display: string;
  account_id?: string;
}

/**
 * Everything owed for one payment, computed in a single place.
 *
 * Both the checkout screen and the gateway call read from this, which is what
 * guarantees the amount a user is shown is the amount they're charged — the
 * two used to derive their totals separately and could disagree.
 */
export interface IResolvedCharge {
  line_items: IPaymentLineItem[];
  /** Before platform charges. */
  subtotal: number;
  platform_fee: number;
  /** subtotal + platform_fee — the amount actually charged. */
  total: number;
  /** `total`, formatted for display. */
  total_display: string;
  currency: string;
}

/**
 * Everything needed to open a payment, resolved server-side before any
 * gateway is touched.
 *
 * Built by one function per payment type, so adding a type means adding a
 * builder and registering it — the gateway call, the DB write and the SDK
 * response below it never change.
 */
export interface IPaymentDetails {
  payment_type: PaymentTypeEnum;
  /** Our own reference, distinct from the gateway's order id. */
  order_id: string;
  /**
   * What this payment costs, in full. The amount billed is always
   * `charge.total` and the currency always `charge.currency` — kept only here
   * so no caller can bill one figure while displaying another.
   */
  charge: IResolvedCharge;
  title: string;
  description: string;
  /**
   * True when this one-time charge is already settled. Resolved here rather
   * than by each caller so /checkout and /initiate-payment can't disagree
   * about whether a payment is still owed.
   */
  is_paid: boolean;
  /**
   * Type-specific context persisted onto the payment row and read back when
   * the payment settles (e.g. which earnings slice a settlement covers).
   */
  metadata: Record<string, unknown>;
  payment_cycle_id?: string | null;
}

/**
 * What one payment type contributes: what it costs, how it's described, and
 * the context that has to survive onto the payment row. The generic layer
 * supplies everything else.
 */
export interface IPaymentTypeDetails {
  charge: IResolvedCharge;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
}

/** Outcome of opening an order — kept whole so both halves can be persisted. */
export interface IGatewayOrderResult {
  gateway_order_id: string;
  /** Exactly what we sent. */
  request: Record<string, any>;
  /** Exactly what came back. */
  response: Record<string, any>;
  sdk_payload: Record<string, any>;
}

export interface IPaymentCheckoutDetails {
  payment_type: PaymentTypeEnum;
  title: string;
  description?: string;
  line_items: IPaymentLineItem[];
  total: number;
  /** `total`, formatted for display. */
  total_display: string;
  currency: string;

  /**
   * True when this is a one-time charge the user has already completed. Lets
   * the checkout screen render a settled state instead of a live pay button —
   * the same condition /initiate-payment refuses on, surfaced early so the
   * user sees "already paid" rather than an error after tapping.
   */
  is_paid: boolean;
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

  /**
   * Opens an order from an already-built, gateway-shaped body.
   *
   * The body is opaque to this port on purpose: each gateway's order API takes
   * a different shape, so the per-gateway formatter (razorpay.helper's
   * formatOrderPayload, and its equivalent for any future gateway) is the seam
   * that knows the wire format, and this stays the seam that sends it.
   */
  createOrder(payload: Record<string, any>): Promise<IGatewayOrder>;

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

/**
 * Razorpay Route onboarding — creating the linked account a creator is paid
 * out to. Separate from IPaymentGateway on purpose: that port is about
 * charging a customer, and every gateway implements it. Payout onboarding has
 * no common shape across gateways, so forcing it into the port would break
 * exactly the gateway-agnosticism the port exists to protect.
 */
export interface ICreateLinkedAccountInput {
  email: string;
  phone: string;
  /** Shown to us and on the creator's own dashboard. */
  legal_business_name: string;
  /** Shown to customers on statements. Defaults to the legal name. */
  customer_facing_business_name?: string;
  /** Razorpay vocabulary: individual, proprietorship, partnership, … */
  business_type: string;
  /** The person Razorpay should contact about this account. */
  contact_name?: string;
  /**
   * Our own id for the creator. Razorpay enforces uniqueness on it, which is
   * what stops a retry from creating a second account for the same person.
   */
  reference_id: string;

  business_category?: string;
  business_subcategory?: string;
  registered_address?: IRouteAddress;
  pan?: string;
  gst?: string;
}

export interface IRouteAddress {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  /** ISO 3166 alpha-2, uppercase — e.g. "IN". */
  country?: string;
}

/**
 * A stakeholder's residential address.
 *
 * Deliberately NOT IRouteAddress: Razorpay takes a single `street` here,
 * while the account's registered address takes `street1`/`street2`. Same
 * concept, two different wire shapes — sharing one type would silently send
 * the wrong keys on one of them.
 */
export interface IStakeholderAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  /** ISO 3166 alpha-2, uppercase — e.g. "IN". */
  country?: string;
}

export interface ICreateStakeholderInput {
  name: string;
  email: string;
  percentage_ownership?: number;
  /** Any of director / executive / any combination Razorpay accepts. */
  relationship?: Record<string, boolean>;
  residential_address?: IStakeholderAddress;
  /** Stakeholder KYC is the individual's PAN, not the business's. */
  pan?: string;
  phone_primary?: string;
  notes?: Record<string, string>;
}

export interface IConfigureRouteProductInput {
  /** Where Razorpay settles this creator's share. */
  account_number: string;
  ifsc_code: string;
  beneficiary_name?: string;
  tnc_accepted?: boolean;
}

export interface IRouteAccount {
  id: string;
  raw: Record<string, any>;
}

export interface IRouteStakeholder {
  id: string;
  raw: Record<string, any>;
}

export interface IRouteProduct {
  id: string;
  /**
   * Razorpay's own field is `activation_status` — "activated",
   * "under_review", "needs_clarification" or "requested". Surfaced verbatim
   * rather than mapped, so the caller decides what each one means.
   */
  activation_status?: string;
  requirements?: Record<string, any>[];
  raw: Record<string, any>;
}
