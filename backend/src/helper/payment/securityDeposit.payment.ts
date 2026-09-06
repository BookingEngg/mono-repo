import { paymentConfig } from "@/config";
import { formatMoney } from "@/helper/money.helper";
import { IPaymentTypeDetails } from "@/interfaces/payment.interface";
import { TPaymentTypeHelper } from "./payment.types";

/**
 * The refundable onboarding deposit a brand pays once, which becomes its
 * marketing spend limit.
 *
 * A fixed, config-owned price — nothing is read from the request, and the
 * client never sends an amount. No platform fee either: we are holding the
 * money, not billing for a service.
 */
export const getSecurityDepositPaymentDetails: TPaymentTypeHelper =
  async (): Promise<IPaymentTypeDetails> => {
    const currency = paymentConfig.currency;
    const depositAmount = paymentConfig.security_deposit_amount;

    return {
      title: "Refundable security deposit",
      description:
        "A one time deposit that becomes your marketing spend limit. Refunded when you leave in good standing.",
      charge: {
        line_items: [
          {
            label: "Security deposit",
            amount: depositAmount,
            amount_display: formatMoney(depositAmount, currency),
            is_transfer_payment: false,
          },
        ],
        subtotal: depositAmount,
        platform_fee: 0,
        total: depositAmount,
        total_display: formatMoney(depositAmount, currency),
        currency,
      },
      // Nothing to carry: a deposit's meaning is fully captured by its type.
      metadata: {},
    };
  };
