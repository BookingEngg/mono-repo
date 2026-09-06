import { PaymentTypeEnum, SettlementScopeEnum } from "@/interfaces/enum";
import { IPaymentTypeDetails } from "@/interfaces/payment.interface";
import { IUser } from "@/interfaces/user.interface";

/**
 * Everything a payment type helper is given.
 *
 * One object rather than a positional list so a new payment type can need a
 * field the others don't, without changing any other helper's signature.
 */
export interface IPaymentRequestBody {
  user: IUser;
  payment_type: PaymentTypeEnum;
  payment_cycle_id?: string;

  settlement_scope?: SettlementScopeEnum;
  settlement_reference?: string;

  /**
   * Pricing cutoff, captured by the caller before any lookup. Types that read
   * moving data (a settlement) must price against it so the amount charged and
   * the rows later marked paid are the same set.
   */
  as_of: Date;
}

/**
 * The contract every payment type implements.
 *
 * A helper is handed the request and returns what its payment costs, how it is
 * described, and the context to persist. It knows nothing about gateways,
 * payment rows or SDKs — so adding one cannot affect an existing type.
 */
export type TPaymentTypeHelper = (
  reqBody: IPaymentRequestBody,
) => Promise<IPaymentTypeDetails>;
