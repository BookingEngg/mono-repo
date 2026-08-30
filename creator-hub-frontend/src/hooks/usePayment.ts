// Modules
import React from "react";
// Services
import { initiatePayment, verifyPayment } from "@/services/Payment.service";
// Utils
import { getErrorMessage } from "@/utils/util";
import { openGatewayCheckout } from "@/lib/paymentGateways";
// Typings
import {
  TPaymentStatus,
  TPaymentType,
  TSettlementScope,
} from "@/typings/payment";

type TUsePaymentInput = {
  paymentType: TPaymentType;
  paymentCycleId?: string;
  /** For an "online" settlement: which slice of pending earnings to pay. */
  settlementScope?: TSettlementScope;
  settlementReference?: string;
  /** Merchant name shown inside the gateway sheet. */
  name?: string;
  description?: string;
  onSuccess?: (orderId: string) => void;
  /** Sheet closed without a completed payment — a cancel, not an error. */
  onIncomplete?: (status: TPaymentStatus) => void;
  onFailure?: (message: string) => void;
};

/**
 * Runs the payment sequence: initiate-payment → gateway SDK → verify-payment.
 *
 * The important property is that verify-payment runs whenever the sheet
 * closes, regardless of *how* it closed. The client never reports the
 * outcome; the server polls the gateway. So a dismissed sheet, a dropped
 * callback and a normal success all converge on the same answer.
 *
 * Gateway-agnostic: it reads the provider off the server's response and
 * defers to the matching adapter.
 */
const usePayment = ({
  paymentType,
  paymentCycleId,
  settlementScope,
  settlementReference,
  name = "Creator Hub",
  description,
  onSuccess,
  onIncomplete,
  onFailure,
}: TUsePaymentInput) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // The gateway sheet outlives React's tree, so a late callback can fire
  // after unmount. Without this guard that would warn and strand `loading`.
  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const stopLoading = React.useCallback(() => {
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, []);

  const fail = React.useCallback(
    (message: string) => {
      if (isMountedRef.current) {
        setError(message);
        setLoading(false);
      }
      onFailure?.(message);
    },
    [onFailure],
  );

  /** STEP 3 — ask the server what actually happened. */
  const settlePayment = React.useCallback(
    async (orderId: string) => {
      try {
        const result = await verifyPayment({ order_id: orderId });
        stopLoading();

        if (result.is_paid) {
          onSuccess?.(orderId);
          return;
        }

        // Not paid isn't necessarily a failure: `pending` means the money is
        // authorized but not captured yet, and `initiated` means they simply
        // closed the sheet. Only a real `failed` is worth an error.
        if (result.payment_status === "failed") {
          fail("The payment did not go through. Please try again.");
          return;
        }

        onIncomplete?.(result.payment_status);
      } catch (caughtError) {
        // The charge may well have succeeded — only our read-back failed. Say
        // so rather than implying it didn't; the webhook still settles it.
        fail(
          getErrorMessage(
            caughtError,
            "We could not confirm your payment. If money was debited it will be reconciled shortly.",
          ),
        );
      }
    },
    [fail, onIncomplete, onSuccess, stopLoading],
  );

  const startPayment = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // STEP 2 — open the order and get the SDK payload.
      const order = await initiatePayment({
        payment_type: paymentType,
        payment_cycle_id: paymentCycleId,
        settlement_scope: settlementScope,
        settlement_reference: settlementReference,
      });

      await openGatewayCheckout({
        sdkPayload: order.sdk_payload,
        name,
        description,
        onClosed: () => settlePayment(order.order_id),
        // The sheet is still open here and the customer can retry, so this
        // only surfaces the reason — it never ends the flow.
        onAttemptFailed: (message) => {
          if (isMountedRef.current) {
            setError(message);
          }
        },
      });
    } catch (caughtError) {
      fail(getErrorMessage(caughtError, "We could not start the payment."));
    }
  }, [
    description,
    fail,
    name,
    paymentCycleId,
    paymentType,
    settlePayment,
    settlementReference,
    settlementScope,
  ]);

  return { startPayment, loading, error, setError };
};

export default usePayment;
