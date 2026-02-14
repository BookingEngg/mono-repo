// Client
import axiosClient from "@/services/http";

/**
 * Get all the valid user for communication
 */
export const getCommunicationUsers = async () => {
  const response = await axiosClient.get({
    url: "/comm/chat-users",
  });

  return response.data;
};

/**
 * Get all the initial chat details of user
 */
export const getUserChatsDetails = async (userId: string) => {
  const response = await axiosClient.get({
    url: `/comm/chat?user_id=${userId}`,
  });

  return response.data;
};

export const getDirectMessages = async (userId: string) => {
  const response = await axiosClient.get({
    url: `/comm/chat-v2?user_id=${userId}`,
  });

  return response.data;
};

/**
 * @deprecated
 * Add a new chat message
 */
export const addNewChatMessage = async (payload: object) => {
  const response = await axiosClient.post({
    url: "/comm/new-chat",
    body: payload,
  });

  return response.data;
};

/**
 * Get all the groups of user
 */
export const getCommunicationGroups = async () => {
  const response = await axiosClient.get({
    url: "/comm/group/list",
  });

  return response.data;
};

/**
 * Get all the initial chat details of group
 */
export const getGroupMessages = async (groupId: string) => {
  const response = await axiosClient.get({
    url: `/comm/group/chats?group_id=${groupId}`,
  });

  return response.data;
};

// Group Services

/**
 * Create a new group in the system
 */
export const createGroup = async (payload: object) => {
  const response = await axiosClient.post({
    url: "/comm/group/new",
    body: payload,
  });

  return response.data;
};

/**
 * Update the group details from the short_id
 */
export const updateGroupDetails = async (shortId: string, payload: object) => {
  const response = await axiosClient.put({
    url: `/comm/group/${shortId}`,
    body: payload,
  });

  return response.data;
};

/**
 * Get all the initial chat details of group
 */
export const getGroupDetailsFromGroupId = async (groupId: string) => {
  const response = await axiosClient.get({
    url: `/comm/group/${groupId}`,
  });

  return response.data;
};
