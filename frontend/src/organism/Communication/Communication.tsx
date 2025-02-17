// Modules
import React from "react";
// Redux Store
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
// Services
import {
  getCommunicationUsers,
  getUserChatsDetails,
} from "@/services/Communication.service";
// Socket IO
import { io } from "socket.io-client";
// Rsuite
import { Button, FlexboxGrid, Input, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Style
import style from "./Communication.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

export interface IUserCommChat {
  index: number;
  username: string;
  receiver_id: string;
  chats: { message: string; user_id: string; user_name: string }[];
}

export interface ICommUser {
  user_id: string;
  name: string;
  date: string;
}
const Communication = () => {
  const socket = io("http://localhost:8080", { transports: ["websocket"] });

  const loggedInUser = useSelector(getAuthUser);
  const [message, setMessage] = React.useState("");
  const [userList, setUserList] = React.useState<ICommUser[]>([]);
  const [currentUserMessages, setCurrentUserMessages] =
    React.useState<IUserCommChat | null>(null);
  const currentUserMessagesRef = React.useRef(currentUserMessages);

  React.useEffect(() => {
    currentUserMessagesRef.current = currentUserMessages;
  }, [currentUserMessages]);

  const handleSendMessage = React.useCallback(async () => {
    if (!message) return;

    const newMessage = {
      message,
      user_id: loggedInUser.user?._id || "",
      user_name: loggedInUser.user?.first_name || "",
    };

    if (currentUserMessages) {
      setCurrentUserMessages({
        ...currentUserMessages,
        chats: [...currentUserMessages.chats, newMessage],
      });
    }

    // Raise an socket event
    socket.emit(
      "new-chat-message",
      JSON.stringify({
        sender_id: loggedInUser.user?._id,
        receiver_id: currentUserMessages?.receiver_id,
        message,
      })
    );
    setMessage("");
  }, [message]);

  const handleUserChange = React.useCallback(
    async (currentUserIndex: number) => {
      const response = await getUserChatsDetails(
        userList[currentUserIndex].user_id
      );

      setCurrentUserMessages({ ...response.data, index: currentUserIndex });
    },
    [userList, currentUserMessages]
  );

  React.useEffect(() => {
    const fetchCommunicationUsers = async () => {
      const response = await getCommunicationUsers();
      setUserList(response.data);
    };
    fetchCommunicationUsers();

    // Initial socket event for mapping
    socket.emit(
      "init",
      JSON.stringify({
        user_id: loggedInUser.user?._id,
      })
    );
  }, []);

  React.useEffect(() => {
    const handleNewMessageReceived = async (datum: {
      user_id: string;
      message: string;
    }) => {
      const { user_id, message } = datum;
      console.log("SOCKET EVENT RECEIVED>>>>>>>>>", message);

      if (user_id !== currentUserMessagesRef.current?.receiver_id) {
        return;
      }

      if (user_id && message) {
        const newMessage = {
          message,
          user_id: user_id,
          user_name: "",
        };

        setCurrentUserMessages((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            chats: [...prev.chats, newMessage],
          };
        });
      }
    };

    socket.on("received-user-chat", handleNewMessageReceived);
  }, [socket]);

  return (
    <FlexboxGrid justify="space-between" className={cx("chat-container")}>
      <FlexboxGridItem colspan={7} className={cx("chat-left-container")}>
        <Text size="xl">Chats</Text>
        <FlexboxGrid>
          {userList.map((user, index) => (
            <FlexboxGridItem
              colspan={24}
              className={cx("left-chat-item")}
              onClick={() => {
                handleUserChange(index);
              }}
            >
              <FlexboxGrid justify="space-between">
                <FlexboxGridItem>{user.name}</FlexboxGridItem>
                <FlexboxGridItem>{user.date}</FlexboxGridItem>
              </FlexboxGrid>
            </FlexboxGridItem>
          ))}
        </FlexboxGrid>
      </FlexboxGridItem>
      <FlexboxGridItem colspan={16} className={cx("chat-right-container")}>
        <Text size="xl">{currentUserMessages?.username}</Text>
        <FlexboxGrid align="middle" justify="start">
          <FlexboxGridItem colspan={24}>
            <FlexboxGrid className={cx("right-chat")}>
              {currentUserMessages?.chats?.length ? (
                currentUserMessages.chats.map((chat) => {
                  const isAuthUserMsg = chat.user_id === loggedInUser.user?._id;

                  return (
                    <FlexboxGridItem
                      className={cx(
                        "right-chat-item",
                        `right-chat-item-${isAuthUserMsg ? "sender" : "receiver"}`
                      )}
                      colspan={24}
                    >
                      <FlexboxGrid justify={isAuthUserMsg ? "end" : "start"}>
                        {chat.message}
                      </FlexboxGrid>
                    </FlexboxGridItem>
                  );
                })
              ) : (
                <></>
              )}
            </FlexboxGrid>
          </FlexboxGridItem>

          <FlexboxGridItem colspan={24}>
            <FlexboxGrid justify="space-between">
              <FlexboxGridItem colspan={20}>
                <Input
                  placeholder="Enter message"
                  value={message}
                  onChange={(value) => {
                    setMessage(value);
                  }}
                />
              </FlexboxGridItem>
              <Button appearance="primary" onClick={handleSendMessage}>
                Send
              </Button>
            </FlexboxGrid>
          </FlexboxGridItem>
        </FlexboxGrid>
      </FlexboxGridItem>
    </FlexboxGrid>
  );
};

export default Communication;
