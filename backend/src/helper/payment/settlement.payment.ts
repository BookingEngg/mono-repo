import { paymentConfig } from "@/config";
import EarningDao from "@/dao/earning.dao";
import UserProfileDao from "@/dao/userProfile.dao";
import { formatMoney } from "@/helper/money.helper";
import { IPaymentTypeDetails } from "@/interfaces/payment.interface";
import { IPaymentRequestBody, TPaymentTypeHelper } from "./payment.types";

const earningDao = new EarningDao();
const userProfileDao = new UserProfileDao();

/**
 * Money is rounded to paise at every step. Without it a 1% fee on ₹812.35
 * carries float noise into the total, and the line items shown no longer add
 * up to what is charged.
 */
const roundToPaise = (amount: number) => Math.round(amount * 100) / 100;

/**
 * What is currently owed to one creator, as an aggregate.
 *
 * Scoped to the caller's own seller_id inside the DAO, so a brand cannot
 * price — or settle — another brand's slice by guessing a reference.
 */
const getPendingSlice = async (reqBody: IPaymentRequestBody) => {
  const { user, settlement_scope, settlement_reference, as_of } = reqBody;

  if (!settlement_scope || !settlement_reference) {
    throw new Error("A settlement scope and reference are required");
  }

  const pendingSlice = await earningDao.getPendingSettlementSummary(
    String(user._id),
    settlement_scope,
    settlement_reference,
    as_of,
  );

  if (pendingSlice.pending_amount <= 0) {
    throw new Error("There is nothing pending to settle here");
  }

  return pendingSlice;
};

/**
 * Settling pending creator earnings — the brand pays out what it owes, plus
 * the platform's cut.
 *
 * `as_of` is the cutoff that makes this safe to charge: conversions keep
 * accruing while the brand is at the gateway, so pricing happens against that
 * timestamp and it is carried in metadata, where settlement reads it back to
 * mark exactly the rows that were paid for.
 */
export const getSettlementPaymentDetails: TPaymentTypeHelper = async (
  reqBody: IPaymentRequestBody,
): Promise<IPaymentTypeDetails> => {
  const creatorProfile = await userProfileDao.getProfileByUserId(
    reqBody.settlement_reference || "",
    ["razorpay_account_id"],
  );

  if (!creatorProfile || !creatorProfile.razorpay_account_id) {
    throw new Error("Creator profile not found");
  }

  const currency = paymentConfig.currency;
  const pendingSlice = await getPendingSlice(reqBody);

  const earningsAmount = roundToPaise(pendingSlice.pending_amount);
  const { job_count: jobCount } = pendingSlice;

  // Falls back rather than trusting the key to exist — a missing config value
  // would otherwise make the fee NaN and poison the total.
  const feePercentage = paymentConfig.platform_fee_percentage ?? 1;
  const platformFee = roundToPaise((earningsAmount * feePercentage) / 100);
  const total = roundToPaise(earningsAmount + platformFee);

  return {
    title: "Settle creator earnings",
    description:
      "Pays out everything currently pending in this slice. Conversions recorded after this point roll into your next settlement.",
    charge: {
      line_items: [
        {
          // Razorpay transfer linked account id
          account_id: creatorProfile.razorpay_account_id,
          // The earnings alone — platform charges are their own line below, so
          // folding them in here would show them charged twice.
          label: `Pending creator earnings across ${jobCount} job${jobCount === 1 ? "" : "s"}`,
          amount: earningsAmount,
          amount_display: formatMoney(earningsAmount, currency),
          job_count: jobCount,
          is_transfer_payment: true,
        },
        {
          label: "Platform charges",
          amount: platformFee,
          amount_display: formatMoney(platformFee, currency),
          is_transfer_payment: false,
        },
      ],
      subtotal: earningsAmount,
      platform_fee: platformFee,
      total,
      total_display: formatMoney(total, currency),
      currency,
    },
    metadata: {
      // The cutoff defining which earnings this payment covers. Anything
      // accruing after it belongs to the next settlement.
      settlement_as_of: reqBody.as_of.toISOString(),
      settlement_scope: reqBody.settlement_scope,
      settlement_reference: reqBody.settlement_reference,
    },
  };
};
