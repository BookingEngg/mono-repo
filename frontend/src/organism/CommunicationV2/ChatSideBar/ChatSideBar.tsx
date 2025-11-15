// Modules
import React from "react";
// Rsuite
import { Container, Text } from "rsuite";
// Typings
import { IEntity } from "@/typings/communication";
// Icons
import { User } from "lucide-react";
// Style
import style from "./ChatSideBar.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const ChatSideBar = (props: {
  chatType: "user" | "group";
  entityList: IEntity[];
  activeEntityId: string | null;
  setActiveEntityId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const {
    chatType,
    entityList = [],
    activeEntityId,
    setActiveEntityId,
  } = props;

  return (
    <Container className={cx("chat-side-bar-container")}>
      <div className={cx("chat-side-bar-header")}>
        <Text size="xl" weight="bold">
          Messages
        </Text>
      </div>

      <div className={cx("chat-side-bar-scroll-container")}>
        {entityList.map((entity) => {
          return (
            <li
              key={entity.id}
              className={cx([
                "wa-group-item",
                `${entity.id === activeEntityId ? "active" : ""}`,
              ])}
              onClick={() => setActiveEntityId(entity.id)}
            >
              {!entity.profile_picture || chatType === "group" ? (
                <div className={cx("wa-group-avatar")}>
                  <User />
                </div>
              ) : (
                <img
                  src={entity.profile_picture}
                  alt="err"
                  className={cx("wa-group-avatar")}
                />
              )}
              <div className={cx("wa-group-info")}>
                <div className={cx("wa-group-name-time")}>
                  <span className={cx("wa-group-name")}>{entity.name}</span>
                  <span className={cx("wa-group-time")}>
                    {entity.last_online_at}
                  </span>
                </div>
                <div className={cx("wa-group-last")}>
                  <span>{entity.last_message}</span>
                  {false ? (
                    <span className={cx("wa-unread-badge")}>{0}</span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </div>
    </Container>
  );
};

export default ChatSideBar;
