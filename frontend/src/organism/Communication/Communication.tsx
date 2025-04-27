// Modules
import React from "react";
import Moment from "moment";
// Redux Store
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
// Services
import {
  getCommunicationUsers,
  getUserChatsDetails,
} from "@/services/Communication.service";
// Socket IO
import { io, Socket } from "socket.io-client";
// Rsuite
import {
  Avatar,
  Button,
  Col,
  Container,
  FlexboxGrid,
  Input,
  Panel,
  Row,
  Text,
} from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Style
import style from "./Communication.module.scss";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(style);

export interface IUserCommChat {
  index: number;
  username: string;
  receiver_id: string;
  chats: {
    message: string;
    user_id: string;
    user_name: string;
    created_at: string;
  }[];
}

export interface ICommUser {
  user_id: string;
  name: string;
  date: string;
  last_online_at: string;
  last_message: string;
  user_profile_picture: string;
}

const Communication = () => {
  const loggedInUser = useSelector(getAuthUser);
  const navigate = useNavigate();

  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [message, setMessage] = React.useState("");
  const [userList, setUserList] = React.useState<ICommUser[]>([]);
  const [currentUserMessages, setCurrentUserMessages] =
    React.useState<IUserCommChat | null>(null);
  const currentUserMessagesRef = React.useRef(currentUserMessages);

  React.useEffect(() => {
    currentUserMessagesRef.current = currentUserMessages;
  }, [currentUserMessages]);

  const handleSendMessage = React.useCallback(async () => {
    if (!message) return;

    const newMessage = {
      message,
      user_id: loggedInUser.user?._id || "",
      user_name: loggedInUser.user?.first_name || "",
      created_at: Moment.utc().utcOffset("+05:30").format("hh:mm a"),
    };

    if (currentUserMessages) {
      setCurrentUserMessages({
        ...currentUserMessages,
        chats: [...currentUserMessages.chats, newMessage],
      });
    }

    // Raise an socket event
    if (socket) {
      socket.emit(
        "new-chat-message",
        JSON.stringify({
          sender_id: loggedInUser.user?._id,
          receiver_id: currentUserMessages?.receiver_id,
          message,
        })
      );
    }
    setMessage("");
  }, [message, socket]);

  // Fetch the communication of selected index user
  const handleUserChange = React.useCallback(
    async (currentUserIndex: number) => {
      const response = await getUserChatsDetails(
        userList[currentUserIndex].user_id
      );

      setCurrentUserMessages({ ...response.data, index: currentUserIndex });
    },
    [userList, currentUserMessages]
  );

  // Fetch the First user message default
  React.useEffect(() => {
    handleUserChange(0);
  }, [userList]);

  React.useEffect(() => {
    const fetchCommunicationUsers = async () => {
      const response = await getCommunicationUsers();
      setUserList(response.data);
    };
    fetchCommunicationUsers();

    // Socket IO connection url
    const newSocket = io("http://localhost:8080", {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    // Initial socket event for mapping
    newSocket.emit(
      "init",
      JSON.stringify({
        user_id: loggedInUser.user?._id,
      })
    );

    return () => {
      newSocket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const handleNewMessageReceived = async (datum: {
      user_id: string;
      message: string;
      created_at: string;
    }) => {
      const { user_id, message, created_at } = datum;

      if (user_id !== currentUserMessagesRef.current?.receiver_id) {
        return;
      }

      if (user_id && message) {
        const newMessage = {
          message,
          user_id: user_id,
          created_at,
          user_name: "",
        };

        setCurrentUserMessages((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            chats: [...prev.chats, newMessage],
          };
        });
      }
    };

    if (socket) {
      socket.on("received-user-chat", handleNewMessageReceived);
    }
  }, [socket]);

  if (userList.length == 0) {
    return (
      <>
        <Row>
          <Panel className="shadow-lg p-4 rounded-xl">
            <h2 className="text-xl md:text-2xl font-semibold">
              You have no friends yet.
            </h2>
          </Panel>
          <Panel>
            <Button
              appearance="primary"
              onClick={() => {
                navigate("/community/add");
              }}
            >
              Make Friends
            </Button>
          </Panel>
        </Row>
      </>
    );
  }

  return (
    <FlexboxGrid justify="space-between" className={cx("chat-container")}>
      <FlexboxGridItem colspan={8} className={cx("chat-left-container")}>
        <Text size="xl">Chats</Text>
        <FlexboxGrid>
          {userList.map((user, index) => (
            <FlexboxGridItem
              colspan={24}
              className={cx([
                "left-chat-item",
                index === currentUserMessages?.index
                  ? "left-chat-item-selected"
                  : "",
              ])}
              onClick={() => {
                handleUserChange(index);
              }}
              id={`chat-item-${index + 1}`}
            >
              <Container className={cx("chat-item-content")}>
                <Row>
                  <Col xs={4} sm={3} md={6} lg={4}>
                    <Avatar
                      className={cx("sidenav-logo")}
                      src={user.user_profile_picture}
                      alt="Profile Image"
                      circle
                      bordered
                      size="md"
                    />
                  </Col>
                  <Col xs={20} sm={21} md={16} lg={20}>
                    <FlexboxGrid>
                      <FlexboxGridItem colspan={24}>
                        <FlexboxGrid>
                          <FlexboxGridItem colspan={19}>
                            <Text
                              size="lg"
                              weight="bold"
                              className={cx("user-item-content-elipsis")}
                            >
                              {user.name}
                            </Text>
                          </FlexboxGridItem>
                          <FlexboxGridItem colspan={5}>
                            <Text size="sm" weight="thin">
                              {user.last_online_at}
                            </Text>
                          </FlexboxGridItem>
                        </FlexboxGrid>
                      </FlexboxGridItem>
                      <FlexboxGridItem
                        colspan={24}
                        className={cx("user-item-content-elipsis")}
                      >
                        {user.last_message}
                      </FlexboxGridItem>
                    </FlexboxGrid>
                  </Col>
                </Row>
              </Container>
            </FlexboxGridItem>
          ))}
        </FlexboxGrid>
      </FlexboxGridItem>
      <FlexboxGridItem colspan={16} className={cx("chat-right-container")}>
        <Text size="xl">{currentUserMessages?.username}</Text>
        <FlexboxGrid align="middle" justify="start">
          <FlexboxGridItem colspan={24}>
            <FlexboxGrid className={cx("right-chat")}>
              {currentUserMessages?.chats?.length ? (
                currentUserMessages.chats.map((chat) => {
                  const isAuthUserMsg = chat.user_id === loggedInUser.user?._id;

                  return (
                    <FlexboxGridItem
                      className={cx(
                        "right-chat-item",
                        `right-chat-item-${isAuthUserMsg ? "sender" : "receiver"}`
                      )}
                      colspan={24}
                    >
                      <FlexboxGrid justify={isAuthUserMsg ? "end" : "start"}>
                        <FlexboxGridItem>{chat.message}</FlexboxGridItem>
                        <FlexboxGridItem colspan={24}></FlexboxGridItem>
                        <FlexboxGridItem>
                          <Text size={"sm"} weight="thin">
                            {chat.created_at}
                          </Text>
                        </FlexboxGridItem>
                      </FlexboxGrid>
                    </FlexboxGridItem>
                  );
                })
              ) : (
                <></>
              )}
            </FlexboxGrid>
          </FlexboxGridItem>

          <FlexboxGridItem colspan={24} className={cx("bottom-chat-section")}>
            <FlexboxGrid justify="space-between">
              <FlexboxGridItem colspan={20}>
                <Input
                  placeholder="Enter message"
                  value={message}
                  onChange={(value) => {
                    setMessage(value);
                  }}
                />
              </FlexboxGridItem>
              <Button appearance="primary" onClick={handleSendMessage}>
                Send
              </Button>
            </FlexboxGrid>
          </FlexboxGridItem>
        </FlexboxGrid>
      </FlexboxGridItem>
    </FlexboxGrid>
  );
};

export default Communication;
