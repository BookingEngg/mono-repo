// Modules
import React from "react";
import { useNavigate } from "react-router-dom";
import Moment from "moment";
// Redux Store
import { useSelector } from "react-redux";
import { getAuthUser } from "@/store/auth";
// Rsuite
import { Button, Container, FlexboxGrid, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Organism
import ChatSideBar from "@/organism/CommunicationV2/ChatSideBar";
import ChatWindow from "@/organism/CommunicationV2/ChatWindow";
// Services
import SocketClient from "@/services/SocketConnection.service";
import {
  getCommunicationUsers,
  getDirectMessages,
} from "@/services/Communication.service";
// Typings
import {
  IEntity,
  IChatPayload,
  INewChatMessageReceive,
} from "@/typings/communication";
// Style
import style from "./ChatMainLayout.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

const initialIsMobileView = window.innerWidth < 768;

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

const ChatMainLayout = () => {
  const navigate = useNavigate();
  const loggedInUser = useSelector(getAuthUser);

  const [entityList, setEntityList] = React.useState<IEntity[]>([]);
  const [activeEntityId, setActiveEntityId] = React.useState<string | null>(
    null
  );

  const [chatMessages, setChatMessages] = React.useState<IChatMessages[]>([]);
  const [chatDetails, setChatDetails] =
    React.useState<IChatDetails>(initialChatDetails);

  const [isMobileView, setIsMobileView] = React.useState(initialIsMobileView);
  const [activeMobileScreen, setActiveMobileScreen] =
    React.useState("user-list");

  // Help to check the screen size and device type
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch the entity list initial
  React.useEffect(() => {
    const fetchEntityList = async () => {
      const response = await getCommunicationUsers();

      if (response) {
        setEntityList(response.data);
        if (!isMobileView) {
          setActiveEntityId(response.data[0]?.id);
        }
      }
    };

    fetchEntityList();
  }, []);

  // If mobile view then set the chat window on screen
  // Fetch user messages if user changes
  React.useEffect(() => {
    if (!activeEntityId) {
      return;
    }
    const fetchChatMessages = async () => {
      if (!activeEntityId) return;

      const response = await getDirectMessages(activeEntityId);
      if (response) {
        setChatMessages(response.data.messages);
        setChatDetails(response.data.entity_details);
      }
    };
    fetchChatMessages();
    setActiveMobileScreen("chat-window");
  }, [activeEntityId]);

  const handleMessageReceived = (payload: INewChatMessageReceive) => {
    const { user_id, name, message, created_at } = payload;

    const messagePayload = {
      content: message,
      sender_id: user_id,
      sender_name: name,
      timestamp: created_at,
      is_sent_by_current_user: false,
    };

    setEntityList((prevList) => {
      const newList = [...prevList];
      const filterUserIdx = newList.findIndex(
        (user) => user.id === user_id
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

    if(activeEntityId !== user_id){
      return;
    }

    // Update receiver message receiver chat window open
    setChatMessages((updatedChatMessages) => {
      if (updatedChatMessages.length === 0) {
        // First message
        return [
          {
            date: Moment.utc().utcOffset("+05:30").format("DD MMM YYYY"),
            items: [messagePayload],
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
          return [
            {
              ...updatedChatMessages[0],
              items: [messagePayload, ...updatedChatMessages[0].items],
            },
            ...updatedChatMessages.slice(1),
          ];
        } else {
          return [
            {
              date: Moment.utc().utcOffset("+05:30").format("DD MMM YYYY"),
              items: [messagePayload],
            },
            ...updatedChatMessages,
          ];
        }
      }
    });
  };

  // Socket Client
  const socketClient = SocketClient<INewChatMessageReceive, IChatPayload>({
    onMessageReceive: handleMessageReceived,
  });

  if (!entityList.length) {
    return (
      <Container className={cx("chat-main-layout")}>
        <div className={cx("no-chat-container")}>
          <Text size="xl" weight="light">
            Find a Friend and Start Chatting!
          </Text>
          <Button
            appearance="ghost"
            onClick={() => {
              navigate("/community/add");
            }}
          >
            Make Friends
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className={cx("chat-main-layout")}>
        {isMobileView ? (
          <>
            <FlexboxGrid justify="space-between">
              {activeMobileScreen === "user-list" && (
                <FlexboxGridItem
                  colspan={24}
                  className={cx(["chat-container", "chat-left-container"])}
                >
                  <ChatSideBar
                    entityList={entityList}
                    activeEntityId={activeEntityId}
                    setActiveEntityId={setActiveEntityId}
                  />
                </FlexboxGridItem>
              )}
              {activeMobileScreen === "chat-window" && (
                <FlexboxGridItem
                  colspan={24}
                  className={cx(["chat-container", "chat-right-container"])}
                >
                  <ChatWindow
                    isMobileView={isMobileView}
                    activeEntityId={activeEntityId}
                    chatDetails={chatDetails}
                    chatMessages={chatMessages}
                    setChatMessages={setChatMessages}
                    entityList={entityList}
                    setEntityList={setEntityList}
                    sendMessage={socketClient.sendSocketMessage}
                    navigateToChatSideBar={() => {
                      setActiveMobileScreen("user-list");
                      setActiveEntityId(null);
                    }}
                  />
                </FlexboxGridItem>
              )}
            </FlexboxGrid>
          </>
        ) : (
          <>
            <FlexboxGrid justify="space-between">
              <FlexboxGridItem
                colspan={8}
                className={cx(["chat-container", "chat-left-container"])}
              >
                <ChatSideBar
                  entityList={entityList}
                  activeEntityId={activeEntityId}
                  setActiveEntityId={setActiveEntityId}
                />
              </FlexboxGridItem>
              <FlexboxGridItem
                colspan={15}
                className={cx(["chat-container", "chat-right-container"])}
              >
                <ChatWindow
                  isMobileView={isMobileView}
                  activeEntityId={activeEntityId}
                  chatDetails={chatDetails}
                  chatMessages={chatMessages}
                  setChatMessages={setChatMessages}
                  entityList={entityList}
                  setEntityList={setEntityList}
                  sendMessage={socketClient.sendSocketMessage}
                />
              </FlexboxGridItem>
            </FlexboxGrid>
          </>
        )}
      </Container>
    </>
  );
};

export default ChatMainLayout;
