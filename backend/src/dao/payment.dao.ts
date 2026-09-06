import { cast, col, fn } from "sequelize";
import { DB } from "@/database/postgres";
import { IPayment } from "@/interfaces/payment.interface";
import {
  PaymentProviderEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
} from "@/interfaces/enum";

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

  /**
   * Whether this user has ever completed a payment of a given type. Drives
   * "already done" state on home widgets, so a brand that has paid its
   * deposit isn't nagged to pay it again.
   */
  public hasSuccessfulPayment = async (
    userId: string,
    paymentType: PaymentTypeEnum,
  ) => {
    const count = await this.paymentModel.count({
      where: {
        user_id: userId,
        payment_type: paymentType,
        payment_status: PaymentStatusEnum.SUCCESS,
      },
    });

    return count > 0;
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
  /**
   * Appends one gateway exchange to the payment's response log.
   *
   * `array_append` runs inside the UPDATE, so the append is atomic: the
   * browser callback and the webhook race by design, and reading the array
   * into JS first would let the slower one overwrite the faster one's entry.
   * A NULL array appends cleanly to a single-element one, so no initialisation
   * is needed.
   *
   * Unguarded on purpose — see markPaymentStatus.
   */
  public appendOnlineResponse = async (id: number, response: object) => {
    const [affectedRows] = await this.paymentModel.update(
      {
        online_response: fn(
          "array_append",
          col("online_response"),
          cast(JSON.stringify(response), "jsonb"),
        ) as any,
      },
      { where: { id } },
    );

    return affectedRows;
  };

  /**
   * Records what the gateway told us about a payment: logs the exchange, and
   * moves the payment's status if it is still open.
   *
   * Two statements rather than one, deliberately. The status update carries a
   * terminal-state guard — the browser callback and the webhook both report
   * the same outcome and race, and the webhook may retry for days, so a late
   * `payment.failed` must not overwrite a captured success. But the response
   * log has no business being guarded: the webhook that lost the race still
   * carries the gateway's own account of the payment, and folding the append
   * into the guarded UPDATE silently discards exactly that. So the exchange is
   * always recorded; only the transition is conditional.
   *
   * Returns the number of rows the status actually moved, so callers can tell
   * a real transition from a duplicate report.
   */
  public markPaymentStatus = async (payload: {
    id: number;
    status: PaymentStatusEnum;
    response?: object;
    transactionId?: string;
  }) => {
    if (payload.response) {
      await this.appendOnlineResponse(payload.id, payload.response);
    }

    const [affectedRows] = await this.paymentModel.update(
      {
        payment_status: payload.status,
        ...(payload.transactionId
          ? { transaction_id: payload.transactionId }
          : {}),
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
