// Modules
import React from "react";
// Rsuite
import { Avatar, Container, Text } from "rsuite";
// Style
import style from "./ChatSideBar.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const dummyEntityList = [
  {
    id: "12202395",
    name: `Tushar Chand Thakur`,
    profile_picture: "aljksdf",
    last_message: "hello, how are you?",
    last_online_at: "12:00 AM",
  },
  {
    id: "123",
    name: `Hello User`,
    profile_picture: "aljksdf",
    last_message: "hi, how are you?",
    last_online_at: "12:00 AM",
  },
];

export interface IEntity {
  id: string;
  name: string;
  profile_picture: string;
  last_message: string;
  last_online_at: string;
}

const ChatSideBar = () => {
  const [entityList, setEntityList] =
    React.useState<IEntity[]>(dummyEntityList);
  const [activeEntityId, setActiveEntityId] = React.useState(
    entityList[0]?.id || ""
  );

  return (
    <Container className={cx("chat-side-bar-container")}>
      <div className={cx("chat-side-bar-header")}>
        <Text size="xl" weight="bold">
          Direct Messages
        </Text>
      </div>

      <div className={cx("chat-side-bar-scroll-container")}>
        {entityList.map((entity) => {
          return (
            <div
              className={cx([
                "chat-message-container",
                `${entity.id === activeEntityId ? "active-chat-message-container" : "default-chat-message-container"}`,
              ])}
            >
              {/* Avatar Section */}
              <div className={cx("avatar-wrapper")}>
                <Avatar
                  className={cx("sidenav-logo")} // Using the same class if you want specific avatar styling
                  src={entity.profile_picture}
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
                    {entity.name}
                  </Text>
                  <Text size="sm" weight="thin" className={cx("timestamp")}>
                    {entity.last_online_at}
                  </Text>
                </div>

                {/* Message Text */}
                <Text className={cx("message-text")}>
                  {entity.last_message}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default ChatSideBar;
