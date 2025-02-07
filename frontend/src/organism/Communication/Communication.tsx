import { Button, FlexboxGrid, Input, Stack, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import classNames from "classnames/bind";
import style from "./Communication.module.scss";
import StackItem from "rsuite/esm/Stack/StackItem";
import React from "react";
const cx = classNames.bind(style);

const initialUserList: { name: string; updatedAt: string }[] = [
  {
    name: "Tushar Chand Thakur",
    updatedAt: "05:16 PM",
  },
  {
    name: "Tejasvi KumarThakur",
    updatedAt: "05:16 PM",
  },
  {
    name: "Manasvi Kumar Thakur",
    updatedAt: "05:16 PM",
  },
];

let currentUserChats: {
  username: string;
  chats: { message: string; time: string }[];
} = {
  username: "Tushar Chand Thakur",
  chats: [
    {
      message: "Hi",
      time: "05:18 PM",
    },
    {
      message: "Hello",
      time: "05:18 PM",
    },
    {
      message: "It's me Tushar",
      time: "05:18 PM",
    },
  ],
};

const Communication = () => {
  const [message, setMessage] = React.useState("");
  const [userList, setUserList] = React.useState(initialUserList);
  const [currentUserMessages, setCurrentUserMessages] =
    React.useState(currentUserChats);

  const handleSendMessage = React.useCallback(() => {
    const newMessage = { message, time: new Date().toString() };
    setCurrentUserMessages({
      ...currentUserMessages,
      chats: [...currentUserMessages.chats, newMessage],
    });
    setMessage("");
  }, [message]);

  const handleUserChange = React.useCallback(
    (currentUserIndex: number) => {
      setCurrentUserMessages({
        ...currentUserChats,
        username: userList[currentUserIndex].name,
      });
    },
    [userList, currentUserChats]
  );

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
                <FlexboxGridItem>{user.updatedAt}</FlexboxGridItem>
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
