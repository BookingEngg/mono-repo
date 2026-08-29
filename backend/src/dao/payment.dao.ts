import { DB } from "@/database/postgres";
import { IPayment } from "@/interfaces/payment.interface";
import { PaymentProviderEnum, PaymentStatusEnum } from "@/interfaces/enum";

class PaymentDao {
  private paymentModel = DB.Payment;

  public createPayment = async (payload: Partial<IPayment>) => {
    return await this.paymentModel.create(payload as any);
  };

  public getPaymentByOrderId = async (orderId: string) => {
    return await this.paymentModel.findOne({ where: { order_id: orderId } });
  };

  public getPaymentByTransactionId = async (
    gateway: PaymentProviderEnum,
    transactionId: string,
  ) => {
    return await this.paymentModel.findOne({
      where: { payment_gateway: gateway, transaction_id: transactionId },
    });
  };

  public getPaymentsByUserId = async (userId: string) => {
    return await this.paymentModel.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });
  };

  public attachTransactionId = async (id: number, transactionId: string) => {
    return await this.paymentModel.update(
      { transaction_id: transactionId },
      { where: { id } },
    );
  };

  /**
   * Terminal-state guard: only moves a payment that is still `initiated` or
   * `pending`. The browser callback and the gateway webhook both report the
   * same outcome and routinely race, and the webhook may be retried for days —
   * without this, a late `payment.failed` retry could overwrite an already
   * captured success. Returns the number of rows actually changed so callers
   * can tell a real transition from a duplicate.
   */
  public markPaymentStatus = async (payload: {
    id: number;
    status: PaymentStatusEnum;
    response?: object;
  }) => {
    const [affectedRows] = await this.paymentModel.update(
      {
        payment_status: payload.status,
        ...(payload.response ? { online_response: payload.response } : {}),
      },
      {
        where: {
          id: payload.id,
          payment_status: [
            PaymentStatusEnum.INITIATED,
            PaymentStatusEnum.PENDING,
          ] as any,
        },
      },
    );

    return affectedRows;
  };
}

export default PaymentDao;
