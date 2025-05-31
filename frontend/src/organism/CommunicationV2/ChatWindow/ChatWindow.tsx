// Modules
import React from "react";
// Rsuite and Icons
import { Button, Container, Input, Text } from "rsuite";
import { ArrowLeft, SendHorizonalIcon } from "lucide-react";
// Style
import style from "./ChatWindow.module.scss";
import classNames from "classnames/bind";
import { getDirectMessages } from "@/services/Communication.service";
const cx = classNames.bind(style);

const initialChatDetails = {
  name: "Anonymous user",
  description: "",
};

export interface IChatMessages {
  date: string;
  items: {
    content: string;
    sender_id: string;
    sender_name: string;
    timestamp: string;
    is_sent_by_current_user: boolean;
  }[];
}

export interface IChatDetails {
  name: string;
  description: string;
}

const ChatWindow = (props: {
  isMobileView: boolean;
  activeEntityId: string | null;
  navigateToChatSideBar?: () => void;
}) => {
  const { isMobileView, activeEntityId: userId, navigateToChatSideBar } = props;

  const [chatMessages, setChatMessages] = React.useState<IChatMessages[]>([]);

  const [chatDetails, setChatDetails] =
    React.useState<IChatDetails>(initialChatDetails);
  const [message, setMessage] = React.useState("");

  const handleMessageSend = React.useCallback(() => {
    setMessage("");
  }, [message]);

  // Fetch user messages if user changes
  React.useEffect(() => {
    const fetchChatMessages = async () => {
      if (!userId) return;

      const response = await getDirectMessages(userId);
      if (response) {
        setChatMessages(response.data.messages);
      }
    };
    fetchChatMessages();
  }, [userId]);

  return (
    <Container className={cx("chat-outer-container")}>
      <div className={cx("chat-section-header")}>
        {isMobileView && (
          <div onClick={navigateToChatSideBar}>
            <ArrowLeft size={15} />
          </div>
        )}
        <Text size="xl" weight="bold">
          {chatDetails.name}
        </Text>
      </div>

      {/* Messages Section */}
      <div className={cx("chat-messages-container")}>
        {chatMessages.map((message) => {
          const messageItems = message.items;

          return (
            <div className={cx("messages-day-container")}>
              <div className={cx("message-day-block")}>
                <Text>{message.date}</Text>
              </div>
              <div className={cx("message-block-container")}>
                {messageItems.map((messageItem) => {
                  return (
                    <div
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
          onChange={(value) => {
            setMessage(value);
          }}
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
