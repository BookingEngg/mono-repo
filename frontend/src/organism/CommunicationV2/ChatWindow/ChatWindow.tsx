// Modules
import React from "react";
import Moment from "moment";
// Rsuite and Icons
import { Avatar, Button, Container, Input, Text } from "rsuite";
import { ArrowLeft, SendHorizonalIcon } from "lucide-react";
// Redux Store
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
// Services
import { getDirectMessages } from "@/services/Communication.service";
// Style
import style from "./ChatWindow.module.scss";
import classNames from "classnames/bind";
import { IChatPayload } from "@/typings/communication";
const cx = classNames.bind(style);

const initialChatDetails = {
  name: "Anonymous user",
  entity_logo: "",
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
  entity_logo: string;
}

const ChatWindow = (props: {
  isMobileView: boolean;
  activeEntityId: string | null;
  sendMessage: (messagePayload: IChatPayload) => void;
  navigateToChatSideBar?: () => void;
}) => {
  const {
    isMobileView,
    activeEntityId: userId,
    navigateToChatSideBar,
    sendMessage,
  } = props;
  const loggedInUser = useSelector(getAuthUser);

  const [chatMessages, setChatMessages] = React.useState<IChatMessages[]>([]);

  const [chatDetails, setChatDetails] =
    React.useState<IChatDetails>(initialChatDetails);
  const [message, setMessage] = React.useState("");

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

    // Raise socket event to receipent
    sendMessage({
      sender_id: loggedInUser.user?._id || "",
      receiver_id: userId || "",
      message,
    });

    // Reset message state
    setMessage("");
  }, [message]);

  // Fetch user messages if user changes
  React.useEffect(() => {
    const fetchChatMessages = async () => {
      if (!userId) return;

      const response = await getDirectMessages(userId);
      if (response) {
        setChatMessages(response.data.messages);
        setChatDetails(response.data.entity_details);
      }
    };
    fetchChatMessages();
  }, [userId]);

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
