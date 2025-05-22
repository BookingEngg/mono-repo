import { Avatar, Container, Text } from "rsuite";
// Style
import style from "./ChatSideBar.module.scss";
import classNames from "classnames/bind";
import React from "react";
const cx = classNames.bind(style);

const chatUserDummy = [
  {
    user_id: "12202395",
    name: `Tushar Chand Thakur`,
    user_profile_picture: "aljksdf",
    last_message: "hello, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Hello User`,
    user_profile_picture: "aljksdf",
    last_message: "hi, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Tushar Chand Thakur`,
    user_profile_picture: "aljksdf",
    last_message: "hello, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Tushar Chand Thakur`,
    user_profile_picture: "aljksdf",
    last_message: "hello, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Hello User`,
    user_profile_picture: "aljksdf",
    last_message: "hi, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Tushar Chand Thakur`,
    user_profile_picture: "aljksdf",
    last_message: "hello, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Tushar Chand Thakur`,
    user_profile_picture: "aljksdf",
    last_message: "hello, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Hello User`,
    user_profile_picture: "aljksdf",
    last_message: "hi, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    user_id: "123",
    name: `Tushar Chand Thakur`,
    user_profile_picture: "aljksdf",
    last_message: "hello, how are you?",
    last_online_at: "12:00 AM",
  },
];

const ChatSideBar = () => {
  const [selectedUser, setSelectedUser] = React.useState("12202395");

  return (
    <Container className={cx("chat-side-bar-container")}>
      <div className={cx("chat-side-bar-header")}>
        <Text size="xl" weight="bold">
          Direct Messages
        </Text>
      </div>

      <div className={cx("chat-side-bar-scroll-container")}>
        {chatUserDummy.map((user) => {
          return (
            <div
              className={cx([
                "chat-message-container",
                `${user.user_id === selectedUser ? "active-chat-message-container" : "default-chat-message-container"}`,
              ])}
            >
              {/* Avatar Section */}
              <div className={cx("avatar-wrapper")}>
                <Avatar
                  className={cx("sidenav-logo")} // Using the same class if you want specific avatar styling
                  src={user.user_profile_picture}
                  alt="Profile Image"
                  circle
                  bordered
                  size="md"
                />
              </div>

              {/* Message Content Section */}
              <div className={cx("message-content")}>
                {/* Header Row: Name and Timestamp */}
                <div className={cx("header-row")}>
                  <Text size="lg" weight="bold" className={cx("user-name")}>
                    {user.name}
                  </Text>
                  <Text size="sm" weight="thin" className={cx("timestamp")}>
                    {user.last_online_at}
                  </Text>
                </div>

                {/* Message Text */}
                <Text className={cx("message-text")}>{user.last_message}</Text>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default ChatSideBar;
