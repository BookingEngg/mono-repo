// Modules
import React from "react";
// Rsuite
import { Avatar, Container, Text } from "rsuite";
// Typings
import { IEntity } from "@/typings/communication";
// Style
import style from "./ChatSideBar.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const ChatSideBar = (props: {
  entityList: IEntity[];
  activeEntityId: string | null;
  setActiveEntityId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const { entityList = [], activeEntityId, setActiveEntityId } = props;

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
              onClick={() => {
                setActiveEntityId(entity.id);
              }}
            >
              {/* Avatar Section */}
              <div className={cx("avatar-wrapper")}>
                <Avatar
                  className={cx("sidenav-logo")} // Using the same class if you want specific avatar styling
                  src={entity.user_profile_picture}
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
