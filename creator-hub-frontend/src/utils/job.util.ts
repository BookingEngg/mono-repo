import { IJobListItem } from "@/typings/creatorHub";

/**
 * Falls back to the category levels when a job predates the product_name
 * field. Shared by JobCard and Checkout so the two screens never disagree on
 * what to show.
 */
export const getJobTitle = (job: IJobListItem): string => {
  if (job.product_name) return job.product_name;

  const parts = [job.category?.l2, job.category?.l3, job.category?.l4].filter(
    Boolean
  );
  return parts.length ? parts.join(" • ") : "Affiliate job";
};

export const getJobPreviewImage = (job: IJobListItem) =>
  job.preview_urls?.find((media) => media.type === "image");
