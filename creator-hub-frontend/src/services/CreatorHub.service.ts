// Client
import axiosClient from "@/services/http";
// Typings
import { ICreateJobPayload } from "@/typings/creatorHub";

// Brand lists a new affiliate job against a product. Requires the BRAND role
// and CREATE_JOBS privilege — enforced server-side in creatorHub.route.ts.
export const createJob = async (payload: ICreateJobPayload) => {
  const response = await axiosClient.post({
    url: "/creator/job",
    body: payload,
  });

  return response.data;
};
