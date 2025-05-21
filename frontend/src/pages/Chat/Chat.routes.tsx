import { TRoutes } from "@/typings/common";
import { Outlet } from "react-router-dom";
import Communication from "@/organism/Communication";
import CommunicationV2 from "@/organism/CommunicationV2";
import { MessageCircle, MessageCircleMore } from "lucide-react";

export const BASE_URL = "/chat";

const getChatRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: (
        <>
          <Outlet />
          <Communication />
        </>
      ),
      icon: <MessageCircle />,
      showOnSideNav: true,
      key: "communication",
      label: "Communication",
      handle: {
        identifier: "root",
      },
    },
    {
      path: `${BASE_URL}-v2`,
      element: <CommunicationV2 />,
      icon: <MessageCircleMore />,
      showOnSideNav: true,
      key: "communication-v2",
      label: "Communication V2",
      handle: {
        identifier: "root",
      },
    },
  ];

  return routes;
};

export default getChatRoutes;
