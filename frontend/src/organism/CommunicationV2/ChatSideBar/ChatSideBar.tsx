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
          Messages
        </Text>
      </div>

      <div className={cx("chat-side-bar-scroll-container")}>
        {entityList.map((entity) => {
          return (
            <li
              key={entity.id}
              className={`wa-group-item ${entity.id === activeEntityId ? "active" : ""}`}
              onClick={() => setActiveEntityId(entity.id)}
            >
              <img
                src={entity.profile_picture}
                alt="err"
                className="wa-group-avatar"
              />
              <div className="wa-group-info">
                <div className="wa-group-name-time">
                  <span className="wa-group-name">{entity.name}</span>
                  <span className="wa-group-time">{entity.last_online_at}</span>
                </div>
                <div className="wa-group-last">
                  <span>{entity.last_message}</span>
                  {true ? (
                    <span className="wa-unread-badge">{0}</span>
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
