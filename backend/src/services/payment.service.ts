import { nanoid } from "nanoid";
import { paymentConfig } from "@/config";
import PaymentDao from "@/dao/payment.dao";
import EarningDao from "@/dao/earning.dao";
import UserService from "@/services/user.service";
import { IUser } from "@/interfaces/user.interface";
import {
  AccountStatusEnum,
  PaymentProviderEnum,
  PaymentStatusEnum,
  PaymentTypeEnum,
  SettlementScopeEnum,
} from "@/interfaces/enum";
import {
  IPayment,
  IPaymentCheckoutDetails,
} from "@/interfaces/payment.interface";
import {
  getActiveGateway,
  getGateway,
} from "@/services/paymentGateway.service";
import {
  ICheckoutQuery,
  IInitiatePaymentPayload,
} from "@/validators/payment.validator";

/**
 * Payment types a user may only ever complete once. A billing-cycle payment
 * is deliberately NOT one of these — each cycle is its own separate charge,
 * so blocking repeats there would break normal invoicing.
 */
const ONE_TIME_PAYMENT_TYPES: ReadonlySet<PaymentTypeEnum> = new Set([
  PaymentTypeEnum.SECURITY_DEPOSIT,
]);

class PaymentService {
  private paymentDao = new PaymentDao();
  private earningDao = new EarningDao();
  private userService = new UserService();

  /**
   * Whether a one-time charge has already been settled by this user. Always
   * false for repeatable types, so callers don't need to special-case them.
   */
  private isAlreadyPaid = async (userId: string, type: PaymentTypeEnum) => {
    if (!ONE_TIME_PAYMENT_TYPES.has(type)) {
      return false;
    }

    return await this.paymentDao.hasSuccessfulPayment(userId, type);
  };

  /**
   * Resolves what a given payment type actually costs, SERVER-SIDE.
   *
   * This is the security boundary of the whole flow: the client only ever
   * names *what* it is paying for, never how much. If the amount came from the
   * request body, anyone could open a ₹1 order for a ₹1000 deposit and the
   * gateway would happily capture it — the signature would still verify,
   * because it signs the order, not the price we intended.
   */
  /**
   * Prices a settlement slice, as a pure aggregate — no earning rows are
   * loaded at any point in the flow.
   *
   * `as_of` is what keeps this safe without an id list: conversions keep
   * accruing while the brand is away at the gateway, so the cutoff is
   * captured here and re-used verbatim when the earnings are marked paid.
   * Same predicate both times, so the set priced is exactly the set settled;
   * anything landing after it belongs to the next settlement.
   */
  private resolveSettlementSlice = async (
    user: IUser,
    payload: {
      settlement_scope?: SettlementScopeEnum;
      settlement_reference?: string;
    },
    asOf: Date,
  ) => {
    if (!payload.settlement_scope || !payload.settlement_reference) {
      throw new Error("A settlement scope and reference are required");
    }

    // Scoped to the caller's own seller_id inside the DAO, so a brand can't
    // price — or settle — another brand's slice by guessing a reference.
    const summary = await this.earningDao.getPendingSettlementSummary(
      String(user._id),
      payload.settlement_scope,
      payload.settlement_reference,
      asOf,
    );

    if (summary.pending_amount <= 0) {
      throw new Error("There is nothing pending to settle here");
    }

    return summary;
  };

  private resolvePayableAmount = async (
    user: IUser,
    paymentType: PaymentTypeEnum,
    payload: {
      settlement_scope?: SettlementScopeEnum;
      settlement_reference?: string;
    },
    asOf: Date,
  ): Promise<{ amount: number; job_count: number }> => {
    switch (paymentType) {
      case PaymentTypeEnum.SECURITY_DEPOSIT:
        return {
          amount: paymentConfig.security_deposit_amount,
          job_count: 0,
        };

      case PaymentTypeEnum.ONLINE: {
        const summary = await this.resolveSettlementSlice(user, payload, asOf);
        return { amount: summary.pending_amount, job_count: summary.job_count };
      }

      default:
        throw new Error("Unsupported payment type");
    }
  };

  /**
   * STEP 1 — /checkout
   *
   * What the customer is about to pay, before anything is created. Read-only
   * on purpose: opening a gateway order here would litter abandoned orders
   * every time someone merely looks at the screen.
   */
  public getCheckoutDetails = async (
    user: IUser,
    query: ICheckoutQuery,
  ): Promise<IPaymentCheckoutDetails> => {
    const { amount, job_count } = await this.resolvePayableAmount(
      user,
      query.payment_type,
      query,
      new Date(),
    );
    const isPaid = await this.isAlreadyPaid(
      String(user._id),
      query.payment_type,
    );

    const presentation: Record<PaymentTypeEnum, Function> = {
      [PaymentTypeEnum.SECURITY_DEPOSIT]: () => {
        return {
          title: "Refundable security deposit",
          description:
            "A one time deposit that becomes your marketing spend limit. Refunded when you leave in good standing.",
          line_items: [{ label: "Security deposit", amount }],
          total: amount,
          currency: paymentConfig.currency,
        };
      },
      [PaymentTypeEnum.ONLINE]: () => {
        // 1% platform fee
        const platformFee = amount / 100;
        return {
          title:
            query.settlement_scope === SettlementScopeEnum.CREATOR
              ? "Settle creator earnings"
              : "Settle job earnings",
          description:
            "Pays out everything currently pending in this slice. Conversions recorded after this point roll into your next settlement.",
          line_items: [
            {
              label: `Pending creator earnings across ${job_count} job${job_count === 1 ? "" : "s"}`,
              amount,
            },
            {
              label: `Platform charges`,
              amount: platformFee,
            },
          ],
          total: amount + platformFee,
          currency: "INR",
        };
      },
    };

    const copy = presentation[query.payment_type]() as {
      title: string;
      description?: string;
      line_items: { label: string; amount: number }[];
      total: number;
      currency: string;
    };

    return {
      payment_type: query.payment_type,
      is_paid: isPaid,
      ...copy,
    };
  };

  /**
   * STEP 2 — /initiate-payment
   *
   * Opens the order on the gateway, records our own `initiated` row, and
   * returns exactly what the SDK needs. No secrets leave this method.
   */
  public initiatePayment = async (
    user: IUser,
    payload: IInitiatePaymentPayload,
  ) => {
    // The authoritative stop on paying a one-time charge twice. The UI also
    // hides the button, but that's cosmetic — this is what makes a direct API
    // call (or a stale tab) fail instead of taking the money again.
    if (await this.isAlreadyPaid(String(user._id), payload.payment_type)) {
      throw new Error("This payment has already been completed.");
    }

    const gateway = getActiveGateway();
    // Captured before pricing so the amount charged and the rows later
    // marked paid are the same set.
    const settlementAsOf = new Date();

    const { amount } = await this.resolvePayableAmount(
      user,
      payload.payment_type,
      payload,
      settlementAsOf,
    );
    const currency = paymentConfig.currency;

    // Our own reference, distinct from the gateway's. Generated before the
    // gateway call so the gateway can echo it back as `receipt`, which is what
    // lets us reconcile even if our own write fails midway.
    const orderId = `${payload.payment_type}_${nanoid(12)}`;

    const gatewayOrder = await gateway.createOrder({
      amount,
      currency,
      receipt: orderId,
      notes: { user_id: String(user._id), payment_type: payload.payment_type },
    });

    await this.paymentDao.createPayment({
      order_id: orderId,
      user_id: String(user._id),
      seller_id: String(user._id),
      payable_amount: amount,
      currency,
      transaction_id: gatewayOrder.gateway_order_id,
      online_request: {
        ...gatewayOrder.raw,
        // The cutoff defining which earnings this payment covers. Anything
        // accruing after it belongs to the next settlement.
        settlement_as_of: settlementAsOf.toISOString(),
        settlement_scope: payload.settlement_scope,
        settlement_reference: payload.settlement_reference,
      },
      payment_type: payload.payment_type,
      payment_status: PaymentStatusEnum.INITIATED,
      payment_gateway: gateway.provider,
      payment_cycle_id: payload.payment_cycle_id,
    });

    return {
      order_id: orderId,
      amount,
      currency,
      // Everything below is fed straight into the gateway SDK by the client.
      sdk_payload: {
        provider: gateway.provider,
        key: gateway.getPublicKey(),
        gateway_order_id: gatewayOrder.gateway_order_id,
        // Gateway widgets want the minor unit; keeping the conversion here
        // means the UI never has to know that rule per gateway.
        amount_in_minor_unit: Math.round(amount * 100),
        currency,
        prefill: {
          name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
          email: user.email,
          contact: user.contact ?? "",
        },
      },
    };
  };

  /**
   * STEP 3 — /verify-payment
   *
   * Called once the SDK closes, for ANY reason: paid, failed, or dismissed.
   * The client tells us nothing about the outcome — we ask the gateway
   * directly and write down what it says. That's what makes this safe to call
   * from a dismissed modal: a user who closed the sheet without paying and a
   * user who paid but lost the callback both get the correct answer.
   */
  public verifyPayment = async (user: IUser, payload: { order_id: string }) => {
    const payment = await this.paymentDao.getPaymentByOrderId(payload.order_id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Scoped to the caller so one user can't probe another's payments.
    if (payment.user_id !== String(user._id)) {
      throw new Error("Payment not found");
    }

    // Already settled by the webhook (or an earlier verify) — nothing to poll.
    const isTerminal =
      payment.payment_status === PaymentStatusEnum.SUCCESS ||
      payment.payment_status === PaymentStatusEnum.FAILED;

    if (isTerminal) {
      return {
        order_id: payment.order_id,
        payment_status: payment.payment_status,
        is_paid: payment.payment_status === PaymentStatusEnum.SUCCESS,
      };
    }

    const gateway = getGateway(payment.payment_gateway as PaymentProviderEnum);
    const result = await gateway.fetchOrderPaymentStatus(
      payment.transaction_id as string,
    );

    // null = the gateway has no decisive attempt yet (customer opened the
    // sheet and walked away). Leave the row alone so the order stays payable
    // and a later webhook can still settle it.
    if (!result.status) {
      return {
        order_id: payment.order_id,
        payment_status: payment.payment_status,
        is_paid: false,
      };
    }

    await this.paymentDao.markPaymentStatus({
      id: payment.id,
      status: result.status,
      response: result.raw,
    });

    // Post process after payment success
    await this.postProcessAfterPaymentSuccess(user, payment, result.status);

    return {
      order_id: payment.order_id,
      payment_status: result.status,
      is_paid: result.status === PaymentStatusEnum.SUCCESS,
    };
  };

  /**
   * A settled security deposit is what activates a brand — it's the gate on
   * posting jobs (see AuthMiddleware.requireActiveAccount).
   *
   * Guarded on SUCCESS specifically: this runs for every terminal outcome, so
   * checking only the payment TYPE would activate an account whose deposit
   * just *failed*.
   *
   * Shared by /verify-payment and the webhook on purpose — a brand that pays
   * and immediately closes the tab is settled by the webhook alone, so
   * activating in only one path would leave them paid but unable to post.
   */
  private postProcessAfterPaymentSuccess = async (
    user: IUser | string,
    payment: IPayment,
    latestPaymentStatus: PaymentStatusEnum,
  ) => {
    if (latestPaymentStatus !== PaymentStatusEnum.SUCCESS) {
      return;
    }

    if (payment.payment_type === PaymentTypeEnum.SECURITY_DEPOSIT) {
      await this.userService.setAccountStatus(user, AccountStatusEnum.ACTIVE);
      return;
    }

    if (payment.payment_type === PaymentTypeEnum.ONLINE) {
      // Settle using the same cutoff the payment was priced against, so
      // conversions that accrued while the brand was at the gateway aren't
      // marked paid without the brand having paid for them.
      const request = (payment.online_request ?? {}) as Record<string, unknown>;
      const asOf = request.settlement_as_of
        ? new Date(request.settlement_as_of as string)
        : undefined;
      const reference = request.settlement_reference as string | undefined;
      const scope = request.settlement_scope as SettlementScopeEnum | undefined;

      if (asOf && reference && scope) {
        await this.earningDao.markPendingEarningsPaid(
          String(payment.seller_id),
          scope,
          reference,
          asOf,
          Number(payment.id),
        );
      }
    }
  };

  /**
   * Gateway-to-server callback. Complements /verify-payment rather than
   * replacing it: this one still lands when the customer never returns to the
   * browser at all (closed laptop, killed tab, dead battery).
   */
  public handleGatewayWebhook = async (input: {
    provider: PaymentProviderEnum;
    rawBody: string;
    signature: string;
    body: Record<string, any>;
  }) => {
    const gateway = getGateway(input.provider);

    if (!gateway.verifyWebhookSignature(input.rawBody, input.signature)) {
      throw new Error("Invalid webhook signature");
    }

    const event = gateway.parseWebhookEvent(input.body);

    // An event we don't act on is still a delivered event — acknowledge it so
    // the gateway stops retrying something we intentionally ignore.
    if (!event?.gateway_order_id) {
      return { handled: false };
    }

    const payment = await this.paymentDao.getPaymentByTransactionId(
      input.provider,
      event.gateway_order_id,
    );

    if (!payment) {
      return { handled: false };
    }

    const affectedRows = await this.paymentDao.markPaymentStatus({
      id: payment.id,
      status: event.status,
      response: input.body,
    });

    // Only the id is available here — a webhook carries no session.
    // Only the id is available here — a webhook carries no session.
    await this.postProcessAfterPaymentSuccess(
      payment.user_id as string,
      payment,
      event.status,
    );

    // 0 rows means it was already terminal — a retry or a race with
    // /verify-payment, both of which are expected and are not errors.
    return { handled: affectedRows > 0 };
  };
}

export default PaymentService;
