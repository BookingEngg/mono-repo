import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
// Redux Store
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";

const BASE_SOCKET_URL = "http://localhost:8080";

const SOCKET_EVENTS = {
  INITIATE_CONNECTION: "init",
  RECEIVED_USER_CHAT: "received-user-chat",
  NEW_MESSAGE: "new-chat-message",
  NEW_GROUP_MESSAGE: "new-group-message",
};

const SocketClient = <T, U>(payload: {
  onMessageReceive: (message: T) => void;
}) => {
  const { onMessageReceive } = payload;
  const [socketClient, setSocketClient] = useState<Socket | null>(null);
  const loggedInUser = useSelector(getAuthUser);

  useEffect(() => {
    const socketConnection = io(BASE_SOCKET_URL, {
      transports: ["websocket"],
    });

    // Store the connection
    setSocketClient(socketConnection);

    // Initate the socket connection for BE mapping for communication
    socketConnection.emit(
      SOCKET_EVENTS.INITIATE_CONNECTION,
      JSON.stringify({
        user_id: loggedInUser.user?._id,
        group_ids: loggedInUser.user?.group_ids,
      })
    );

    // Disconnect the local connection instance
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketClient) {
      return;
    }

    socketClient.on(SOCKET_EVENTS.RECEIVED_USER_CHAT, (data) => {
      onMessageReceive(data);
    });

    // ... Add all the other socket events for communications..
  }, [socketClient]);

  return {
    sendDirectMessage: (messagePayload: U) => {
      if (!socketClient) {
        return;
      }

      socketClient.emit(
        SOCKET_EVENTS.NEW_MESSAGE,
        JSON.stringify(messagePayload)
      );
    },
    sendGroupMessage: (messagePayload: U) => {
      if (!socketClient) {
        return;
      }

      socketClient.emit(
        SOCKET_EVENTS.NEW_GROUP_MESSAGE,
        JSON.stringify(messagePayload)
      );
    },
  };
};

export default SocketClient;
