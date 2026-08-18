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
  "due_date",
  "is_active",
  "is_visible",
];

// Fully-formatted earning text (e.g. "Earn 10% of order value", "Earn ₹50 per
// order") — built once here so the frontend never has to know the per-type
// rules (percentage has no ₹ prefix, fixed/CPC do) or duplicate the copy.
const EARNING_MODEL_LABEL: Record<EarningModelTypeEnum, string> = {
  [EarningModelTypeEnum.PERCENTAGE]: "of order value",
  [EarningModelTypeEnum.FIXED_PER_ORDER]: "per order",
  [EarningModelTypeEnum.CPC]: "per click",
};

export const buildEarningModelDisplay = (
  earningModel?: IEarningModel,
): string | undefined => {
  if (!earningModel) return undefined;

  const amount =
    earningModel.type === EarningModelTypeEnum.PERCENTAGE
      ? `${earningModel.value}%`
      : `₹${earningModel.value}`;

  return `Earn ${amount} ${EARNING_MODEL_LABEL[earningModel.type]}`;
};

export const buildJobCheckoutDetails = (
  job: IJob,
  brandName?: string,
): IJobCheckoutDetails => ({
  ...buildJobListItem(job, brandName),
  earning_display: buildEarningModelDisplay(job.earning_model),
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
  earning_display: buildEarningModelDisplay(application.job_details.earning_model),
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
