// Modules
import React from "react";
// Rsuite and Icons
import { Button, Container, Input, Text } from "rsuite";
import { SendHorizonalIcon } from "lucide-react";
// Style
import style from "./ChatWindow.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const apiResponse = {
  meta: {
    page_no: 1,
    page_size: 20,
  },
  messages: [
    {
      date: "19-03-2025",
      items: [
        {
          content:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae saepe tempore quasi debitis illum voluptate odit a reprehenderit magni natus. Recusandae mollitia repellendus rem quasi dignissimos atque quam natus pariatur deserunt error. Suscipit veritatis ad perferendis sint velit pariatur animi sunt libero excepturi exercitationem quia fuga incidunt deleniti neque rem quaerat voluptate quisquam molestiae laudantium nisi eos, facilis, blanditiis mollitia? Culpa ea nostrum dolorem pariatur! Reiciendis nulla, provident laudantium adipisci voluptates atque beatae accusantium cumque aperiam excepturi vitae debitis, aspernatur sapiente molestiae quaerat! Quidem eveniet recusandae, consequatur quos deserunt praesentium autem quia hic dignissimos, pariatur quo quae blanditiis ducimus fugiat!",
          sender_id: "id",
          sender_name: "Tushar Chand Thakur",
          timestamp: "12:15 am",
          is_sent_by_current_user: true,
        },
        {
          content: "msg2",
          sender_id: "id1",
          sender_name: "Tushar Chand Thakur",
          timestamp: "12:15 am",
          is_sent_by_current_user: false,
        },
      ],
    },
    {
      date: "18-03-2025",
      items: [
        {
          content:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae saepe tempore quasi debitis illum voluptate odit a reprehenderit magni natus. Recusandae mollitia repellendus rem quasi dignissimos atque quam natus pariatur deserunt error. Suscipit veritatis ad perferendis sint velit pariatur animi sunt libero excepturi exercitationem quia fuga incidunt deleniti neque rem quaerat voluptate quisquam molestiae laudantium nisi eos, facilis, blanditiis mollitia? Culpa ea nostrum dolorem pariatur! Reiciendis nulla, provident laudantium adipisci voluptates atque beatae accusantium cumque aperiam excepturi vitae debitis, aspernatur sapiente molestiae quaerat! Quidem eveniet recusandae, consequatur quos deserunt praesentium autem quia hic dignissimos, pariatur quo quae blanditiis ducimus fugiat!",
          sender_id: "id",
          sender_name: "Tushar Chand Thakur",
          timestamp: "12:15 am",
          is_sent_by_current_user: false,
        },
      ],
    },
  ],
};

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

const ChatWindow = () => {
  const [chatMessages, setChatMessages] = React.useState<IChatMessages[]>(
    apiResponse.messages
  );
  const [chatDetails, setChatDetails] =
    React.useState<IChatDetails>(initialChatDetails);
  const [message, setMessage] = React.useState("");

  const handleMessageSend = React.useCallback(() => {
    setMessage("");
  }, [message]);

  return (
    <Container className={cx("chat-outer-container")}>
      <div className={cx("chat-section-header")}>
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
