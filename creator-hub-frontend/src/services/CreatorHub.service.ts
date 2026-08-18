// Client
import axiosClient from "@/services/http";
// Typings
import {
  ICreateJobPayload,
  IJobApplicationListResponse,
  IJobCheckoutDetails,
  IJobListResponse,
} from "@/typings/creatorHub";

// Brand lists a new affiliate job against a product. Requires the BRAND role
// and CREATE_JOBS privilege — enforced server-side in creatorHub.route.ts.
export const createJob = async (payload: ICreateJobPayload) => {
  const response = await axiosClient.post({
    url: "/creator/job",
    body: payload,
  });

  return response.data;
};

// Influencer's explore feed — every active job across all brands.
export const listInfluencerJobs = async (params: {
  page: number;
  limit: number;
}): Promise<IJobListResponse> => {
  const response = await axiosClient.get({
    url: "/creator/job",
    params,
  });

  return response.data;
};

// A brand's own posted jobs only.
export const listBrandJobs = async (params: {
  page: number;
  limit: number;
}): Promise<IJobListResponse> => {
  const response = await axiosClient.get({
    url: "/creator/job/brand",
    params,
  });

  return response.data;
};

// Checkout/apply-summary detail for a single job. Influencer only — a brand
// hitting this for its own job is rejected server-side.
export const getJobCheckoutDetails = async (
  shortId: string
): Promise<IJobCheckoutDetails> => {
  const response = await axiosClient.get({
    url: `/creator/checkout/${shortId}`,
  });

  return response.data.data;
};

// Influencer applies for a job. Already exists server-side
// (creatorHubController.applyForJob) — this is just the frontend wrapper.
export const applyForJob = async (jobShortId: string) => {
  const response = await axiosClient.post({
    url: "/creator/job-application",
    body: { job_short_id: jobShortId },
  });

  return response.data;
};

// Every job application the influencer has made, most recent first.
export const listJobApplications = async (params: {
  page: number;
  limit: number;
}): Promise<IJobApplicationListResponse> => {
  const response = await axiosClient.get({
    url: "/creator/job-application",
    params,
  });

  return response.data;
};
