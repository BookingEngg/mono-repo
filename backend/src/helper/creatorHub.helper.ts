import { IJob, IJobCheckoutDetails, IJobListItem } from "@/interfaces/job.interface";
import { IJobApplicationJobDetails } from "@/interfaces/jobApplication.interface";

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

export const buildJobCheckoutDetails = (
  job: IJob,
  brandName?: string,
): IJobCheckoutDetails => ({
  ...buildJobListItem(job, brandName),
  earning_model: job.earning_model,
  due_date: job.due_date,
});

// snapshot only the terms that matter once applied — not job_count,
// is_active/is_visible, gender/age_limit, preview_urls, etc.
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
