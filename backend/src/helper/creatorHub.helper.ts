import {
  IEarningModel,
  IJob,
  IJobCheckoutDetails,
  IJobListItem,
} from "@/interfaces/job.interface";
import {
  IJobApplication,
  IJobApplicationJobDetails,
  IJobApplicationListItem,
} from "@/interfaces/jobApplication.interface";
import { EarningModelTypeEnum } from "@/interfaces/enum";

export const isJobOpenForApplication = (job: IJob): boolean =>
  job.is_active &&
  job.is_visible &&
  job.job_count.completed < job.job_count.available;

// Field names to project at the DB level for GET /creator/job — keep this in
// sync with IJobListItem below so we never fetch more than the listing needs.
// seller_id is included so the brand's display name can be resolved from the
// user table rather than stored on the job itself.
export const JOB_LIST_PROJECTION = [
  "short_id",
  "job_type",
  "seller_id",
  "product_name",
  "category",
  "preview_urls",
  "job_count",
];

// brandName is resolved by the caller from the seller's user record (job.seller_id)
export const buildJobListItem = (job: IJob, brandName?: string): IJobListItem => ({
  short_id: job.short_id,
  job_type: job.job_type,
  brand_name: brandName,
  product_name: job.product_name,
  category: job.category,
  preview_urls: job.preview_urls,
  job_count: job.job_count,
});

// GET /creator/job/checkout/:shortId also needs is_active/is_visible to
// verify the job is still open before rendering, on top of the list shape.
export const JOB_CHECKOUT_PROJECTION = [
  ...JOB_LIST_PROJECTION,
  "earning_model",
  "selling_price",
  "due_date",
  "is_active",
  "is_visible",
];

const EARNING_MODEL_LABEL: Record<EarningModelTypeEnum, string> = {
  [EarningModelTypeEnum.PERCENTAGE]: "per order",
  [EarningModelTypeEnum.FIXED_PER_ORDER]: "per order",
  [EarningModelTypeEnum.CPC]: "per click",
};

/**
 * What the creator actually pockets per conversion, in rupees.
 *
 * PERCENTAGE needs the selling price to mean anything — without it there is
 * no honest figure to show, so this returns undefined rather than guessing a
 * base. FIXED_PER_ORDER and CPC are already absolute amounts.
 */
export const calculateEarningAmount = (
  earningModel?: IEarningModel,
  sellingPrice?: number,
): number | undefined => {
  if (!earningModel) return undefined;

  if (earningModel.type !== EarningModelTypeEnum.PERCENTAGE) {
    return earningModel.value;
  }

  if (sellingPrice === undefined || sellingPrice === null) {
    return undefined;
  }

  // Rounded to paise so a 33% share of ₹999 doesn't surface as ₹329.6699999.
  return Math.round(sellingPrice * (earningModel.value / 100) * 100) / 100;
};

/**
 * Commission owed on a single job application, in rupees.
 *
 * Reads the apply-time snapshot rather than the live Job on purpose: the
 * terms a creator agreed to are fixed at apply time, so a brand editing the
 * price or the rate afterwards must not change what an existing application
 * pays out. Pass the application itself and this stays true by construction —
 * there's no live-job parameter to accidentally reach for.
 *
 * Typed on `job_details` alone so it accepts anything carrying that field: a
 * full mongoose doc, a `.lean()` object, or a projected list row.
 *
 * Returns undefined when the commission genuinely can't be determined (a
 * PERCENTAGE application snapshotted before selling_price existed). That is
 * deliberately NOT 0 — "unknown" and "earns nothing" are different, and
 * collapsing them would silently accrue zero-value earnings.
 */
export const calculateJobApplicationCommission = (
  application: Pick<IJobApplication, "job_details">,
): number | undefined =>
  calculateEarningAmount(
    application?.job_details?.earning_model,
    application?.job_details?.selling_price,
  );

const formatRupees = (amount: number): string =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount)}`;

/**
 * Fully-formatted earning text, built once here so the frontend never has to
 * know the per-type rules or duplicate the copy.
 *
 * Leads with the rupee figure because that's the question a creator is
 * actually asking — "Earn 10% of order value" is unanswerable without knowing
 * the price, which is what prompted adding selling_price in the first place.
 * The percentage is kept in parentheses so the terms stay visible.
 *
 * Falls back to the old percentage-only wording for jobs created before
 * selling_price existed, rather than showing a wrong or empty amount.
 */
export const buildEarningModelDisplay = (
  earningModel?: IEarningModel,
  sellingPrice?: number,
): string | undefined => {
  if (!earningModel) return undefined;

  const label = EARNING_MODEL_LABEL[earningModel.type];
  const amount = calculateEarningAmount(earningModel, sellingPrice);

  if (amount === undefined) {
    // PERCENTAGE with no price on record — the only case that lands here.
    return `Earn ${earningModel.value}% of order value`;
  }

  if (earningModel.type === EarningModelTypeEnum.PERCENTAGE) {
    return `Earn ${formatRupees(amount)} ${label} (${earningModel.value}% of ${formatRupees(sellingPrice as number)})`;
  }

  return `Earn ${formatRupees(amount)} ${label}`;
};

export const buildJobCheckoutDetails = (
  job: IJob,
  brandName?: string,
): IJobCheckoutDetails => ({
  ...buildJobListItem(job, brandName),
  earning_display: buildEarningModelDisplay(job.earning_model, job.selling_price),
  earning_amount: calculateEarningAmount(job.earning_model, job.selling_price),
  selling_price: job.selling_price,
  due_date: job.due_date,
});

// snapshot only the terms that matter once applied — not job_count,
// is_active/is_visible, gender/age_limit, product_name/preview_urls (those
// are resolved fresh from the Job on read instead), etc.
export const buildJobApplicationJobDetails = (
  job: IJob,
): IJobApplicationJobDetails => ({
  seller_id: job.seller_id,
  product_id: job.product_id,
  product_link: job.product_link,
  category: job.category,
  earning_model: job.earning_model,
  selling_price: job.selling_price,
  due_date: job.due_date,
});

// Fields to project at the DB level for GET /creator/job-application.
export const JOB_APPLICATION_LIST_PROJECTION = [
  "short_id",
  "job_short_id",
  "job_type",
  "job_details",
  "link_short_id",
  "createdAt",
];

// brandName is resolved by the caller from the seller's user record
// (application.job_details.seller_id); job is the current Job document
// (looked up by application.job_short_id) so product_name/preview_urls
// always reflect the job as it is now, not a stale snapshot.
export const buildJobApplicationListItem = (
  application: IJobApplication,
  brandName?: string,
  job?: Pick<IJob, "product_name" | "preview_urls">,
): IJobApplicationListItem => ({
  short_id: application.short_id,
  job_short_id: application.job_short_id,
  job_type: application.job_type,
  brand_name: brandName,
  product_name: job?.product_name,
  preview_urls: job?.preview_urls,
  earning_display: buildEarningModelDisplay(
    application.job_details.earning_model,
    application.job_details.selling_price,
  ),
  earning_amount: calculateJobApplicationCommission(application),
  selling_price: application.job_details.selling_price,
  due_date: application.job_details.due_date,
  link_short_id: application.link_short_id,
  createdAt: application.createdAt,
});

// tags the destination with utm_campaign=sessionId so repeat clicks within
// the same session (tracked via a 1hr cookie) attribute together downstream
export const appendUtmParams = (
  destinationUrl: string,
  jobApplicationShortId: string,
  sessionId: string,
): string => {
  const url = new URL(destinationUrl);
  url.searchParams.set("utm_source", "CreatorHub");
  url.searchParams.set("utm_campaign", jobApplicationShortId);
  url.searchParams.set("utm_medium", sessionId);
  return url.toString();
};
