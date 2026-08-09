import { IJob } from "@/interfaces/job.interface";
import { IJobApplicationJobDetails } from "@/interfaces/jobApplication.interface";

export const isJobOpenForApplication = (job: IJob): boolean =>
  job.is_active && job.is_visible && job.job_count.available > 0;

// snapshot only the terms that matter once applied — not job_count,
// is_active/is_visible, gender/age_limit, preview_urls, etc.
export const buildJobApplicationJobDetails = (
  job: IJob,
): IJobApplicationJobDetails => ({
  seller_id: job.seller_id,
  product_id: job.product_id,
  brand_name: job.brand_name,
  product_link: job.product_link,
  category: job.category,
  earning_model: job.earning_model,
  due_date: job.due_date,
});

// tags the destination with utm_campaign=visitorId so repeat clicks from the
// same visitor (tracked via cookie) attribute to a single visitor downstream
export const appendUtmParams = (destinationUrl: string, visitorId: string): string => {
  const url = new URL(destinationUrl);
  url.searchParams.set("utm_source", "CreatorHub");
  url.searchParams.set("utm_campaign", visitorId);
  return url.toString();
};
