import { IJobListItem, IJobMedia } from "@/typings/creatorHub";

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

// Shared by anything that only has a preview_urls array to work with (job
// listings, job application snapshots) rather than a full IJobListItem.
export const getPreviewImage = (previewUrls?: IJobMedia[]) =>
  previewUrls?.find((media) => media.type === "image");

export const getJobPreviewImage = (job: IJobListItem) =>
  getPreviewImage(job.preview_urls);

// The redirect route (GET /creator/post/:shortId) is served by the same API
// host the frontend already talks to (see services/http.ts), not a separate
// public domain — so the shareable link is built the same way axios resolves
// relative URLs against VITE_API_URL.
export const getJobApplicationLink = (linkShortId: string): string => {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${apiUrl}/creator/post/${linkShortId}`;
};
