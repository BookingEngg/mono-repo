import { PaymentTypeEnum } from "@/interfaces/enum";
import { getSecurityDepositPaymentDetails } from "./securityDeposit.payment";
import { getSettlementPaymentDetails } from "./settlement.payment";
import { IPaymentRequestBody, TPaymentTypeHelper } from "./payment.types";

/**
 * Payment type to the helper that prices it.
 *
 * This is the only file that changes when a payment type is added: write a
 * helper in its own module, add a line here. No existing helper is touched, and
 * nothing downstream — the gateway call, the payment row, the SDK response —
 * knows a new type exists.
 */
const PAYMENT_TYPE_HELPERS: Record<PaymentTypeEnum, TPaymentTypeHelper> = {
  [PaymentTypeEnum.SECURITY_DEPOSIT]: getSecurityDepositPaymentDetails,
  [PaymentTypeEnum.ONLINE]: getSettlementPaymentDetails,
};

/**
 * Prices a payment of any type.
 *
 * A type with no helper is unsupported by construction — there is no default
 * branch to fall through, so an unregistered type fails loudly here rather
 * than reaching a gateway with an amount nobody computed.
 */
export const getPaymentDetails = async (
  paymentType: PaymentTypeEnum,
  reqBody: IPaymentRequestBody,
) => {
  const paymentTypeHelper = PAYMENT_TYPE_HELPERS[paymentType];

  if (!paymentTypeHelper) {
    throw new Error("Unsupported payment type");
  }

  return await paymentTypeHelper(reqBody);
};

export * from "./payment.types";
