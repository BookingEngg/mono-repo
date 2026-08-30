// Client
import axiosClient from "@/services/http";
// Typings
import {
  ISettlementByCreatorRow,
  ISettlementByJobRow,
  ISettlementResponse,
} from "@/typings/settlement";

/**
 * Both endpoints are scoped server-side to the caller's own seller_id — the
 * client never passes a brand id, so one brand can't read another's position.
 */
export const getSettlementByJob = async (): Promise<
  ISettlementResponse<ISettlementByJobRow>
> => {
  const response = await axiosClient.get({ url: "/settlement/job" });
  return response.data;
};

export const getSettlementByCreator = async (): Promise<
  ISettlementResponse<ISettlementByCreatorRow>
> => {
  const response = await axiosClient.get({ url: "/settlement/creator" });
  return response.data;
};
