// Client
import axiosClient from "@/services/http";

/**
 * Get all the global users (excluding friends and blocked users)
 */
export const getAllNewUsers = async (pagination: object) => {
  const response = await axiosClient.get({
    url: "/community/users",
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

/**
 * Get all the valid user for communication
 */
export const getCommunityFriends = async (pagination: object) => {
  const response = await axiosClient.get({
    url: "/community/friends",
    params: pagination,
  });

  return response.data;
};

/**
 * Get all the valid user for communication
 */
export const getCommunityBlockedUsers = async (pagination: object) => {
  const response = await axiosClient.get({
    url: "/community/blocked-user",
    params: pagination,
  });

  return response.data;
};
