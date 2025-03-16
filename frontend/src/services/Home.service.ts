// Client
import axiosClient from "@/services/http";

/**
 * Get Summary Details
 */
export const getSummaryDetails = async () => {
  const response = await axiosClient.get({
    url: `/user/summary`,
  });

  return response.data;
};
