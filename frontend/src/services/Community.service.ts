// Client
import axiosClient from "@/services/http";

/**
 * Get all the community user accourding to the tab
 */
export const getCommunityUsers = async (
  pagination: object,
  tabName: "new-users" | "friends" | "blocked-users"
) => {
  const response = await axiosClient.get({
    url: `/community/${tabName}`,
    params: pagination,
  });

  return response.data;
};

export const makeNewFriendRequest = async (payload: object) => {
  const response = await axiosClient.put({
    url: "/community/friend/request",
    body: payload,
  });

  return response.data;
};

export const updateFriendRequestStatus = async (payload: object) => {
  const response = await axiosClient.put({
    url: "/community/friend/request-status",
    body: payload,
  });

  return response.data;
};

export const unblockUserStatus = async (payload: object) => {
  const response = await axiosClient.put({
    url: "/community/friend/unblock",
    body: payload,
  });

  return response.data;
};
