import { z } from "zod";
import { PaymentTypeEnum, SettlementScopeEnum } from "@/interfaces/enum";

/**
 * Note what is deliberately ABSENT from every schema here: an amount. The
 * client names what it is paying for; the server prices it (see
 * PaymentService.resolvePayableAmount). Accepting an amount would make the
 * whole flow forgeable.
 */

// Which slice of pending earnings an ONLINE settlement covers. Note there is
// still no amount here — the server sums the slice itself.
const settlementScopeFields = {
  settlement_scope: z.enum(SettlementScopeEnum).optional(),
  settlement_reference: z.string().min(1).optional(),
};

// STEP 1 — GET /checkout
export const checkoutQuerySchema = z.object({
  payment_type: z.enum(PaymentTypeEnum),
  payment_cycle_id: z.string().min(1).optional(),
  ...settlementScopeFields,
});

export type ICheckoutQuery = z.infer<typeof checkoutQuerySchema>;

// STEP 2 — POST /initiate-payment
export const initiatePaymentSchema = z.object({
  payment_type: z.enum(PaymentTypeEnum),
  payment_cycle_id: z.string().min(1).optional(),
  ...settlementScopeFields,
});

export type IInitiatePaymentPayload = z.infer<typeof initiatePaymentSchema>;

/**
 * STEP 3 — POST /verify-payment
 *
 * Takes only our own order reference. Nothing about the outcome is accepted
 * from the client: the server polls the gateway and believes that instead.
 */
export const verifyPaymentSchema = z.object({
  order_id: z.string().min(1),
});

export type IVerifyPaymentPayload = z.infer<typeof verifyPaymentSchema>;
