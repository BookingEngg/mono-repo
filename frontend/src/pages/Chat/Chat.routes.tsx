
import { TRoutes } from "@/typings/common";
import CommunicationLogo from "@/atoms/icons/Communication";
import { Outlet } from "react-router-dom";
import Communication  from "@/organism/Communication";

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
      icon: <CommunicationLogo />,
      showOnSideNav: true,
      key: "communication",
      label: "Communication",
    },
  ];

  return routes;
};

export default getChatRoutes;
