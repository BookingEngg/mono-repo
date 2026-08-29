import { paymentConfig } from "@/config";
import { PaymentProviderEnum } from "@/interfaces/enum";
import { IPaymentGateway } from "@/interfaces/payment.interface";
import RazorpayHttp from "@/https/razorpay.http";

/**
 * Registry of gateway adapters. Adding a provider is: implement
 * IPaymentGateway, add a PaymentProviderEnum value, add one line here.
 * Nothing in the service, controller, or UI layer changes.
 */
const GATEWAY_REGISTRY: Record<PaymentProviderEnum, IPaymentGateway> = {
  [PaymentProviderEnum.RAZORPAY]: new RazorpayHttp(),
};

/**
 * Gateway a *new* payment should be opened with. Existing payments always
 * resolve by their own stored `payment_gateway` (see getGateway) so switching
 * the active gateway never strands in-flight payments — their verify and
 * webhook calls keep going to the gateway that actually created them.
 */
export const getActiveGateway = (): IPaymentGateway => {
  return getGateway(paymentConfig.active_gateway as PaymentProviderEnum);
};

export const getGateway = (provider: PaymentProviderEnum): IPaymentGateway => {
  const gateway = GATEWAY_REGISTRY[provider];

  if (!gateway) {
    throw new Error(`Unsupported payment gateway: ${provider}`);
  }

  return gateway;
};
