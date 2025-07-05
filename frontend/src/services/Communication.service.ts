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
}

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
