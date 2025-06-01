import { TRoutes } from "@/typings/common";
import Communication from "@/organism/Communication";
import CommunicationV2 from "@/organism/CommunicationV2";
import { MessageCircle, MessageCircleMore } from "lucide-react";

const BASE_OLD_URL = "/chat";
const BASE_URL = "/chat-v2";

const getChatRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_OLD_URL,
      element: <Communication />,
      icon: <MessageCircle />,
      showOnSideNav: false, // Make the user not accessible from side nav
      key: "communication",
      label: "Communication",
      handle: {
        identifier: "root",
      },
    },
    {
      path: BASE_URL,
      element: <CommunicationV2 />,
      icon: <MessageCircleMore />,
      showOnSideNav: true,
      key: "communication-v2",
      label: "Communication",
      handle: {
        identifier: "root",
      },
    },
  ];

  return routes;
};

export default getChatRoutes;
