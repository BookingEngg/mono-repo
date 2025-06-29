// Modules
import React from "react";
// Rsuite
import { Button, Container, FlexboxGrid, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Organism
import ChatSideBar from "@/organism/CommunicationV2/ChatSideBar";
import ChatWindow from "@/organism/CommunicationV2/ChatWindow";
// Services
import SocketClient from '@/services/SocketConnection.service';
// Typings
import { IEntity, IChatPayload } from "@/typings/communication";
// Style
import style from "./ChatMainLayout.module.scss";
import classNames from "classnames/bind";
import { getCommunicationUsers } from "@/services/Communication.service";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(style);

const initialIsMobileView = window.innerWidth < 768;

const ChatMainLayout = () => {
  const navigate = useNavigate();

  const [entityList, setEntityList] = React.useState<IEntity[]>([]);
  const [activeEntityId, setActiveEntityId] = React.useState<string | null>(
    null
  );

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
  React.useEffect(() => {
    if (!activeEntityId) {
      return;
    }
    setActiveMobileScreen("chat-window");
  }, [activeEntityId]);

  // Socket Client
  const socketClient = SocketClient<object, IChatPayload>({
    onMessageReceive: (payload: object) => {
      console.log("PAYLOAD>>>> ", payload);
    }
  })

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
