
import { TRoutes } from "@/typings/common";
import { Outlet } from "react-router-dom";
import Communication  from "@/organism/Communication";
import { MessageCircle } from "lucide-react";

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
  ];

  return routes;
};

export default getChatRoutes;
