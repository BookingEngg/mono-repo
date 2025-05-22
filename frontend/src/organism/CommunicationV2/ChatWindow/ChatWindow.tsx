import { Avatar, Button, Container, Input, Text } from "rsuite";
// Style
import style from "./ChatWindow.module.scss";
import classNames from "classnames/bind";
import React from "react";
import { Send, SendHorizonalIcon } from "lucide-react";
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

const messages = apiResponse.messages;

const ChatWindow = () => {
  const [chatTitle, setChatTitle] = React.useState("Tushar Chand Thakur");

  const [message, setMessage] = React.useState("");

  const handleMessageSend = React.useCallback(() => {
    setMessage("");
  }, [message]);

  return (
    <Container className={cx("chat-outer-container")}>
      <div className={cx("chat-section-header")}>
        <Text size="xl" weight="bold">
          {chatTitle}
        </Text>
      </div>

      {/* Messages Section */}
      <div className={cx("chat-messages-container")}>
        {messages.map((message) => {
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
