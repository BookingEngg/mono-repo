// Modules
import React from "react";
// Services
import {
  getCommunicationUsers,
  addNewChatMessage,
  getUserChatsDetails,
} from "@/services/Communication.service";
// Socket IO
import { io } from "socket.io-client";
// Rsuite
import { Button, FlexboxGrid, Input, Stack, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import StackItem from "rsuite/esm/Stack/StackItem";
// Style
import style from "./Communication.module.scss";
import classNames from "classnames/bind";
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
const cx = classNames.bind(style);

let initialUserChat: {
  index: number;
  username: string;
  user_id: string;
  chats: { message: string; time: string }[];
} = {
  index: -1,
  username: "",
  user_id: "",
  chats: [],
};

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
    React.useState(initialUserChat);

  const handleSendMessage = React.useCallback(async () => {
    const newMessage = { message, time: "" };
    setCurrentUserMessages({
      ...currentUserMessages,
      chats: [...currentUserMessages.chats, newMessage],
    });
    // await addNewChatMessage({ user_id: currentUserMessages.user_id, message });

    // Raise an socket event
    socket.emit(
      "new-chat-message",
      JSON.stringify({
        sender_id: loggedInUser.user?._id,
        user_id: currentUserMessages.user_id,
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
  }, []);

  React.useEffect(() => {
    socket.on("refetch-user-chat", async (_) => {
      const response = await getUserChatsDetails(
        userList[currentUserMessages.index].user_id
      );

      setCurrentUserMessages({
        ...response.data,
        index: currentUserMessages.index,
      });
    });
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
        <Text size="xl">{currentUserMessages.username}</Text>
        <FlexboxGrid align="middle" justify="start">
          <FlexboxGridItem colspan={24}>
            <Stack direction="column" className={cx("right-chat")}>
              {currentUserMessages.chats.map((chat) => (
                <StackItem className={cx("right-chat-item")}>
                  <FlexboxGrid justify="space-between">
                    <FlexboxGridItem>{chat.message}</FlexboxGridItem>
                    <FlexboxGridItem>{chat.time}</FlexboxGridItem>
                  </FlexboxGrid>
                </StackItem>
              ))}
            </Stack>
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
