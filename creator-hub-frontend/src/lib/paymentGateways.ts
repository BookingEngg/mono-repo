// Typings
import { IPaymentSdkPayload, TPaymentProvider } from "@/typings/payment";

type TOpenCheckoutInput = {
  sdkPayload: IPaymentSdkPayload;
  name: string;
  description?: string;
  /**
   * The SDK finished with a completed payment handshake, OR the customer
   * closed the sheet. Both land here because the client is not the source of
   * truth either way — the caller re-checks with the server regardless.
   */
  onClosed: () => void;
  /**
   * A payment attempt failed while the sheet is still open (the customer can
   * still retry). Surface the reason; don't treat it as final.
   */
  onAttemptFailed: (message: string) => void;
};

/**
 * A gateway's browser half: pull in its SDK, then open it. Everything above
 * this file (the hook, the components, the pages) works against this
 * interface only, so a new gateway is one more adapter in the registry below
 * rather than a change to any component.
 */
interface IGatewayAdapter {
  scriptUrl: string;
  open: (input: TOpenCheckoutInput) => void;
}

// Keyed by script url so two gateways never fight over one cache entry, and
// so a second open() reuses the tag already in the document instead of
// stacking duplicates.
const scriptPromises: Record<string, Promise<void> | undefined> = {};

const loadScript = (src: string): Promise<void> => {
  const cached = scriptPromises[src];
  if (cached) {
    return cached;
  }

  const pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Drop the cached rejection so a later attempt can retry — an ad
      // blocker or a flaky network shouldn't permanently disable checkout
      // for the rest of the session.
      delete scriptPromises[src];
      reject(new Error("Could not load the payment gateway."));
    };
    document.body.appendChild(script);
  });

  scriptPromises[src] = pending;
  return pending;
};

const razorpayAdapter: IGatewayAdapter = {
  scriptUrl: "https://checkout.razorpay.com/v1/checkout.js",

  open: ({ sdkPayload, name, description, onClosed, onAttemptFailed }) => {
    const RazorpayConstructor = (window as any).Razorpay;

    if (!RazorpayConstructor) {
      onAttemptFailed("Payment gateway is unavailable. Please try again.");
      return;
    }

    const checkout = new RazorpayConstructor({
      key: sdkPayload.key,
      order_id: sdkPayload.gateway_order_id,
      amount: sdkPayload.amount_in_minor_unit,
      currency: sdkPayload.currency,
      name,
      description,
      prefill: sdkPayload.prefill,
      // Razorpay hands us its signed handshake here, but we deliberately
      // ignore its contents — the server re-reads the outcome from Razorpay
      // itself, so nothing is trusted just because it reached this callback.
      handler: () => onClosed(),
      modal: { ondismiss: () => onClosed() },
    });

    // Razorpay leaves the sheet OPEN after a failed attempt so the customer
    // can pick another method. So this is not the end of the flow — the real
    // close still arrives via ondismiss (or handler, if they then succeed).
    checkout.on("payment.failed", (event: any) => {
      onAttemptFailed(
        event?.error?.description || "That payment attempt failed.",
      );
    });

    checkout.open();
  },
};

const GATEWAY_ADAPTERS: Record<TPaymentProvider, IGatewayAdapter> = {
  RAZORPAY: razorpayAdapter,
};

export const openGatewayCheckout = async (input: TOpenCheckoutInput) => {
  const adapter = GATEWAY_ADAPTERS[input.sdkPayload.provider];

  if (!adapter) {
    throw new Error(`Unsupported payment gateway: ${input.sdkPayload.provider}`);
  }

  await loadScript(adapter.scriptUrl);
  adapter.open(input);
};
