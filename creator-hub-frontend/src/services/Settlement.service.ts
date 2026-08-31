// Client
import axiosClient from "@/services/http";
// Typings
import {
  ISettlementByCreatorRow,
  ISettlementResponse,
} from "@/typings/settlement";

/**
 * Scoped server-side to the caller's own seller_id — the client never passes
 * a brand id, so one brand can't read another's position.
 */
export const getSettlementByCreator = async (): Promise<
  ISettlementResponse<ISettlementByCreatorRow>
> => {
  const response = await axiosClient.get({ url: "/settlement/creator" });
  return response.data;
};
