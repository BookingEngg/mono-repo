import { nanoid } from "nanoid";
import { paymentConfig } from "@/config";
import { getPaymentDetails } from "@/helper/payment";
import { formatOrderPayload } from "@/helper/razorpay.helper";
import PaymentDao from "@/dao/payment.dao";
import EarningDao from "@/dao/earning.dao";
import UserProfileDao from "@/dao/userProfile.dao";
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
  IGatewayOrderResult,
  IPayment,
  IPaymentCheckoutDetails,
  IPaymentDetails,
  IPaymentTypeDetails,
  IResolvedCharge,
} from "@/interfaces/payment.interface";
import {
  getActiveGateway,
  getGateway,
} from "@/services/paymentGateway.service";
import {
  ICheckoutQuery,
  IInitiatePaymentPayload,
  IPaymentRequestPayload,
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
  private userProfileDao = new UserProfileDao();

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
   * STEP 1 — /checkout
   *
   * What the user is about to pay for, before any gateway is involved. Thin on
   * purpose: every figure and every word comes from the same resolver that
   * /initiate-payment bills from, so the two cannot disagree.
   */
  public getCheckoutDetails = async (
    user: IUser,
    query: ICheckoutQuery,
  ): Promise<IPaymentCheckoutDetails> => {
    const paymentDetails = await this.resolvePaymentDetails(user, query);

    return {
      payment_type: paymentDetails.payment_type,
      is_paid: paymentDetails.is_paid,
      title: paymentDetails.title,
      description: paymentDetails.description,
      line_items: paymentDetails.charge.line_items,
      total: paymentDetails.charge.total,
      total_display: paymentDetails.charge.total_display,
      currency: paymentDetails.charge.currency,
    };
  };

  /**
   * Everything about a payment, for any type: what it costs, what to call it,
   * whether it is already settled, and the reference we will bill it under.
   *
   * Pricing itself lives in helper/payment — one module per type — so this
   * stays type-agnostic and adding a type never touches this file.
   *
   * The order id is generated here rather than after the gateway call so the
   * gateway can echo it back as `receipt`, which is what lets us reconcile
   * even if our own write fails midway.
   */
  public resolvePaymentDetails = async (
    user: IUser,
    payload: IPaymentRequestPayload,
    asOf: Date = new Date(),
  ): Promise<IPaymentDetails> => {
    const { payment_type: paymentType } = payload;

    const [{ charge, title, description, metadata }, isPaid] =
      await Promise.all([
        getPaymentDetails(paymentType, { ...payload, user, as_of: asOf }),
        this.isAlreadyPaid(String(user._id), paymentType),
      ]);

    return {
      payment_type: paymentType,
      order_id: `${paymentType}_${nanoid(12)}`,
      charge,
      title,
      description,
      is_paid: isPaid,
      metadata,
      payment_cycle_id: payload.payment_cycle_id,
    };
  };

  /**
   * Opens the order on the gateway from already-resolved payment details.
   *
   * Returns the request and the response whole, not just the id: both are
   * persisted, and when a payment is disputed weeks later the exact bytes we
   * sent and got back are the only account of what happened.
   */
  private createGatewayOrder = async (
    user: IUser,
    paymentDetails: IPaymentDetails,
  ): Promise<IGatewayOrderResult> => {
    const gateway = getActiveGateway();
    const { charge, order_id, payment_type, metadata } = paymentDetails;

    const request = formatOrderPayload({
      payment_type,
      // The charge decides the amount, the currency and the itemised lines.
      charge,
      receipt: order_id,
      user_id: String(user._id),
      settlement_scope: metadata.settlement_scope as string | undefined,
      settlement_reference: metadata.settlement_reference as string | undefined,
    });

    const gatewayOrder = await gateway.createOrder(request);

    return {
      gateway_order_id: gatewayOrder.gateway_order_id,
      request,
      response: gatewayOrder.raw as Record<string, any>,
      // Everything here is fed straight into the gateway SDK by the client.
      sdk_payload: {
        provider: gateway.provider,
        key: gateway.getPublicKey(),
        gateway_order_id: gatewayOrder.gateway_order_id,
        // Gateway widgets want the minor unit; keeping the conversion here
        // means the UI never has to know that rule per gateway.
        amount_in_minor_unit: Math.round(charge.total * 100),
        currency: charge.currency,
        prefill: {
          name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
          email: user.email,
          contact: user.contact ?? "",
        },
      },
    };
  };

  /**
   * STEP 2 — /initiate-payment
   *
   * Type-agnostic by design: resolve the details for whatever type was asked
   * for, open the order, record it, hand back the SDK payload. Nothing here
   * knows what a security deposit or a settlement is — that all lives in the
   * per-type builders above.
   *
   * No secrets leave this method.
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

    // Captured before pricing so the amount charged and the rows later marked
    // paid are the same set.
    const paymentDetails = await this.resolvePaymentDetails(
      user,
      payload,
      new Date(),
    );

    const { gateway_order_id, request, response, sdk_payload } =
      await this.createGatewayOrder(user, paymentDetails);

    await this.paymentDao.createPayment({
      order_id: paymentDetails.order_id,
      user_id: String(user._id),
      seller_id: String(user._id),
      payable_amount: paymentDetails.charge.total,
      currency: paymentDetails.charge.currency,
      transaction_id: gateway_order_id,
      // What we sent, plus the type's own context — settlement reads
      // settlement_as_of back out of here when the payment succeeds.
      online_request: { ...request, ...paymentDetails.metadata },
      // What the gateway returned. Previously this landed in online_request
      // too, which left the row with no record of the request at all.
      online_response: [response],
      payment_type: paymentDetails.payment_type,
      payment_status: PaymentStatusEnum.INITIATED,
      payment_gateway: getActiveGateway().provider,
      payment_cycle_id: paymentDetails.payment_cycle_id,
    });

    return {
      order_id: paymentDetails.order_id,
      amount: paymentDetails.charge.total,
      currency: paymentDetails.charge.currency,
      sdk_payload,
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
