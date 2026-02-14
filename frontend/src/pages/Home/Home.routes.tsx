// Icons
import { HomeIcon } from "lucide-react";
// Organism
import Home from "@/organism/Home";
// Typings
import { TRoutes } from "@/typings/common";
// Constants
import { ROLES } from "@/constants/common.constant";

export const BASE_URL = "/";

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
      accessible_roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    },
  ];

  return routes;
};

export default getHomeRoutes;
