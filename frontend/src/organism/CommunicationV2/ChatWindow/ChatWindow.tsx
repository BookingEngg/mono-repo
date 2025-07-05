// Modules
import React from "react";
import Moment from "moment";
// Rsuite and Icons
import { Avatar, Button, Container, Input, Text } from "rsuite";
import { ArrowLeft, SendHorizonalIcon } from "lucide-react";
// Redux Store
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
// Style
import style from "./ChatWindow.module.scss";
import classNames from "classnames/bind";
import { IChatPayload, IEntity } from "@/typings/communication";
import { IChatDetails, IChatMessages } from "../ChatMainLayout/ChatMainLayout";
const cx = classNames.bind(style);

const ChatWindow = (props: {
  isMobileView: boolean;
  activeEntityId: string | null;
  chatDetails: IChatDetails;
  chatMessages: IChatMessages[];
  setChatMessages: React.Dispatch<React.SetStateAction<IChatMessages[]>>;
  entityList: IEntity[];
  setEntityList: React.Dispatch<React.SetStateAction<IEntity[]>>;
  sendMessage: (messagePayload: IChatPayload) => void;
  navigateToChatSideBar?: () => void;
}) => {
  const {
    isMobileView,
    activeEntityId,
    chatDetails,
    chatMessages,
    setChatMessages,
    entityList,
    setEntityList,
    navigateToChatSideBar,
    sendMessage,
  } = props;

  const loggedInUser = useSelector(getAuthUser);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const activeEntity = entityList.find((entity) => entity.id === activeEntityId);
    if(activeEntity?.unsend_last_message) {
      setMessage(activeEntity.unsend_last_message);
    }

  }, [activeEntityId, entityList]);

  // Handle send message from the sender
  const handleMessageSend = React.useCallback(() => {
    // Update sender message UI block to avoid (refetching)
    setChatMessages((updatedChatMessages) => {
      if (updatedChatMessages.length === 0) {
        // First message
        return [
          {
            date: Moment.utc().utcOffset("+05:30").format("DD MMM YYYY"),
            items: [
              {
                content: message,
                sender_id: loggedInUser.user?._id || "",
                sender_name: loggedInUser.user?.first_name || "",
                timestamp: Moment.utc().utcOffset("+05:30").format("hh:mm a"),
                is_sent_by_current_user: true,
              },
            ],
          },
        ];
      } else {
        // Message exists already

        // If last message block is today
        const lastMessageBlockDate = updatedChatMessages[0].date;
        if (
          Moment(lastMessageBlockDate).isSame(
            Moment.utc().utcOffset("+05:30"),
            "day"
          )
        ) {
          updatedChatMessages[0].items.unshift({
            content: message,
            sender_id: loggedInUser.user?._id || "",
            sender_name: loggedInUser.user?.first_name || "",
            timestamp: Moment.utc().utcOffset("+05:30").format("hh:mm a"),
            is_sent_by_current_user: true,
          });

          return updatedChatMessages;
        } else {
          return [
            {
              date: Moment.utc().utcOffset("+05:30").format("DD MMM YYYY"),
              items: [
                {
                  content: message,
                  sender_id: loggedInUser.user?._id || "",
                  sender_name: loggedInUser.user?.first_name || "",
                  timestamp: Moment.utc().utcOffset("+05:30").format("hh:mm a"),
                  is_sent_by_current_user: true,
                },
              ],
            },
            ...updatedChatMessages,
          ];
        }
      }
    });

    setEntityList((prevList) => {
      const newList = [...prevList];
      const filterUserIdx = newList.findIndex(
        (user) => user.id === activeEntityId
      );

      if (filterUserIdx === -1) return newList;

      const filterUser = {
        ...newList[filterUserIdx],
        last_message: message,
        last_online_at: Moment.utc().utcOffset("+05:30").format("hh:mm a"),
      };

      newList.splice(filterUserIdx, 1); // Remove old position
      newList.unshift(filterUser); // Insert at top

      return newList;
    });

    // Raise socket event to receipent
    sendMessage({
      sender_id: loggedInUser.user?._id || "",
      sender_name: loggedInUser.user?.first_name || "",
      receiver_id: activeEntityId || "",
      message,
    });

    // Reset message state
    setMessage("");
  }, [message]);

  const handleOnChangeMessage = (value: string) => {
    setEntityList((prevList) => {
      const newList = [...prevList];
      const filterUserIdx = newList.findIndex(
        (user) => user.id === activeEntityId
      );
      if (filterUserIdx === -1) return newList;

      newList[filterUserIdx].unsend_last_message = value;
      return newList;
    });

  }

  return (
    <Container className={cx("chat-outer-container")}>
      <div className={cx("chat-section-header")}>
        {isMobileView && (
          <div onClick={navigateToChatSideBar}>
            <ArrowLeft size={20} />
          </div>
        )}
        <Avatar src={chatDetails.entity_logo} alt="Entity" circle size="md" />
        <Text size="xl" weight="bold">
          {chatDetails.name}
        </Text>
      </div>

      {/* Messages Section */}
      <div className={cx("chat-messages-container")}>
        {chatMessages.map((message, index) => {
          const messageItems = message.items;

          return (
            <div
              key={`chat-container-${index}`}
              className={cx("messages-day-container")}
            >
              <div className={cx("message-day-block")}>
                <Text>{message.date}</Text>
              </div>
              <div className={cx("message-block-container")}>
                {messageItems.map((messageItem, i) => {
                  return (
                    <div
                      key={`chat-item-${i}`}
                      className={cx([
                        "message-block",
                        `${messageItem.is_sent_by_current_user ? "current-user-message" : "other-user-message"}`,
                      ])}
                    >
                      {!messageItem.is_sent_by_current_user ? (
                        <Text size="md" weight="semibold">
                          {messageItem.sender_name}
                        </Text>
                      ) : (
                        <></>
                      )}
                      <Text size="md" weight="regular">
                        {messageItem.content}
                      </Text>
                      <div className={cx("message-block-time")}>
                        <Text size="sm" weight="thin">
                          {messageItem.timestamp}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={cx("chat-control-container")}>
        <Input
          type="text"
          size="md"
          placeholder="Message"
          value={message}
          onChange={handleOnChangeMessage}
          onPressEnter={handleMessageSend}
        />

        <Button
          disabled={message === ""}
          appearance="primary"
          onClick={handleMessageSend}
        >
          <SendHorizonalIcon />{" "}
        </Button>
      </div>
    </Container>
  );
};

export default ChatWindow;
