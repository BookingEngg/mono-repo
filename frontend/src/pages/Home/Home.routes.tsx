import { TRoutes } from "@/typings/common";
import Home from "@/organism/Home";
import { HomeIcon } from "lucide-react";

export const BASE_URL = "/";
export const PROFILE_BASE_URL = "/profile";

const getHomeRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: <Home />,
      icon: <HomeIcon />,
      showOnSideNav: true,
      key: "home",
      label: "Summary",
      handle: { identifier: "root" },
    },
    {
      path: PROFILE_BASE_URL,
      element: <Home />,
      showOnSideNav: false,
      showOnTab: false,
      key: "profile",
      label: "Profile",
      handle: { identifier: "root" },
    },
  ];

  return routes;
};

export default getHomeRoutes;
