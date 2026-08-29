// Client
import axiosClient from "@/services/http";
// Typings
import { IHomeWidget } from "@/typings/home";

/**
 * Widgets for the signed-in account's home screen. Which ones come back is
 * decided server-side from the caller's roles, so the client renders whatever
 * it is given rather than duplicating the role rules.
 */
export const getHomeWidgets = async (): Promise<IHomeWidget[]> => {
  const response = await axiosClient.get({
    url: "/home/widgets",
  });

  return response.data?.data?.widgets ?? [];
};
