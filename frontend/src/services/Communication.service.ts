const prefix = "http://localhost:8080/backend/api/v1/platform";

export const getCommunicationUsers = async (): Promise<{
  data: { user_id: string; name: string; date: string }[];
}> => {
  const response = await fetch(`${prefix}/comm/chat-users`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "include",
  });

  return response.json();
};

export const getUserChatsDetails = async (
  userId: string
): Promise<{
  data: {
    username: string;
    receiver_id: string;
    chats: {
      message: string;
      user_id: string;
      user_name: string;
      created_at: string;
    }[];
  };
}> => {
  const response = await fetch(`${prefix}/comm/chat?user_id=${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "include",
  });

  return response.json();
};

export const addNewChatMessage = async (payload: {
  user_id: string;
  message: string;
}) => {
  const response = await fetch(`${prefix}/comm/new-chat`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  console.log("MESSAGE RESPONSE>>>>>>>>", response);

  return response.json();
};
