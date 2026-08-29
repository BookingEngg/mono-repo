import { PaymentProviderEnum, PaymentStatusEnum, PaymentTypeEnum } from "./enum";

// A brand's payment against a Creator Hub billing cycle — per the flow in
// backend/src/models/creator_hub.txt: creators accrue earnings, the brand is
// periodically billed creator_earnings_total + platform_fee, and pays that
// total in one shot. This row holds everything about that one payment; the
// per-payee fan-out (Creator A, Creator B, platform) that follows a
// successful payment is a separate concern, not modeled here.
export interface IPayment {
  id?: number;

  seller_id?: string;
  order_id: string;
  user_id?: string;
  payable_amount: number;
  currency: string;
  transaction_id?: string; // partner order id

  online_request?: object;
  online_response?: object;

  payment_type: PaymentTypeEnum;
  payment_status: PaymentStatusEnum;
  payment_gateway: PaymentProviderEnum;
  payment_cycle_id?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
