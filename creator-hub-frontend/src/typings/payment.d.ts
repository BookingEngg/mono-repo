// Mirrors the backend PaymentTypeEnum. What a payment costs is decided
// server-side from this value — the client never sends an amount.
export type TPaymentType = "security_deposit" | "online";

// Which slice of pending earnings an "online" settlement covers. Settlement
// is per creator — a brand pays a person, not a campaign. The server sums the
// slice itself; the client never sends an amount.
export type TSettlementScope = "creator";

export type TPaymentProvider = "RAZORPAY";

export type TPaymentStatus = "initiated" | "success" | "pending" | "failed";

export interface IPaymentLineItem {
  label: string;
  amount: number;
}

/** STEP 1 response — the pre-payment summary. */
export interface IPaymentCheckoutDetails {
  payment_type: TPaymentType;
  title: string;
  description?: string;
  line_items: IPaymentLineItem[];
  total: number;
  currency: string;
  // True for a one-time charge already settled by this user. The server
  // refuses to initiate one of these regardless; this just lets the screen
  // say so up front instead of erroring after a tap.
  is_paid: boolean;
}

/**
 * Everything the browser needs to launch a gateway's SDK. The backend fills
 * this in per provider, so the UI reads the same shape no matter which
 * gateway is active.
 */
export interface IPaymentSdkPayload {
  provider: TPaymentProvider;
  key: string; // public merchant key, safe on the client
  gateway_order_id: string;
  amount_in_minor_unit: number; // paise for INR — the unit SDKs expect
  currency: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

/** STEP 2 response. */
export interface IInitiatePaymentResponse {
  order_id: string; // our own reference, not the gateway's
  amount: number; // major units, for display
  currency: string;
  sdk_payload: IPaymentSdkPayload;
}

/** STEP 3 response — the settled outcome, as the gateway reported it. */
export interface IVerifyPaymentResponse {
  order_id: string;
  payment_status: TPaymentStatus;
  is_paid: boolean;
}
