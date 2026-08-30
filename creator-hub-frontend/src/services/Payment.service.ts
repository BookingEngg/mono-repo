// Client
import axiosClient from "@/services/http";
// Typings
import {
  IInitiatePaymentResponse,
  IPaymentCheckoutDetails,
  IVerifyPaymentResponse,
  TPaymentType,
  TSettlementScope,
} from "@/typings/payment";

/**
 * STEP 1 — what the customer is about to pay. Read-only: calling this does
 * not create an order, so opening the screen and leaving costs nothing.
 */
export const getPaymentCheckoutDetails = async (params: {
  payment_type: TPaymentType;
  payment_cycle_id?: string;
  settlement_scope?: TSettlementScope;
  settlement_reference?: string;
}): Promise<IPaymentCheckoutDetails> => {
  const response = await axiosClient.get({
    url: "/checkout",
    params,
  });

  return response.data?.data;
};

/**
 * STEP 2 — opens the order and returns the payload the gateway SDK needs.
 *
 * No amount parameter by design: the server prices `payment_type` itself, so
 * the client can't understate what it owes.
 */
export const initiatePayment = async (payload: {
  payment_type: TPaymentType;
  payment_cycle_id?: string;
  settlement_scope?: TSettlementScope;
  settlement_reference?: string;
}): Promise<IInitiatePaymentResponse> => {
  const response = await axiosClient.post({
    url: "/payment/initiate-payment",
    body: payload,
  });

  return response.data?.data;
};

/**
 * STEP 3 — called once the SDK closes, for ANY reason (paid, failed, or
 * dismissed). Deliberately sends nothing about the outcome: the server polls
 * the gateway and settles against that, so a lost callback or a closed sheet
 * still resolves to the truth.
 */
export const verifyPayment = async (payload: {
  order_id: string;
}): Promise<IVerifyPaymentResponse> => {
  const response = await axiosClient.post({
    url: "/payment/verify-payment",
    body: payload,
  });

  return response.data?.data;
};
