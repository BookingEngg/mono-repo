// Modules
import React from "react";
// Rsuite
import { Col, Container, FlexboxGrid, Row } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Organism
import ChatSideBar from "@/organism/CommunicationV2/ChatSideBar";
import ChatWindow from "@/organism/CommunicationV2/ChatWindow";
// Style
import style from "./ChatMainLayout.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

const ChatMainLayout = () => {
  const [isMobileView, setIsMobileView] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Container className={cx("chat-main-layout")}>
        {isMobileView ? (
          <></>
        ) : (
          <>
            <FlexboxGrid>
              <FlexboxGridItem
                colspan={7}
                className={cx(["chat-container", "chat-left-container"])}
              >
                <ChatSideBar />
              </FlexboxGridItem>
              <FlexboxGridItem
                colspan={17}
                className={cx(["chat-container", "chat-right-container"])}
              >
                <ChatWindow />
              </FlexboxGridItem>
            </FlexboxGrid>
          </>
        )}
      </Container>
    </>
  );
};

export default ChatMainLayout;
