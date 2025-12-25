// Icons
import { Settings } from "lucide-react";
// Organism
import { Outlet } from "react-router-dom";
// Typings
import { TRoutes } from "@/typings/common";
// Constants
import { ROLES } from "@/constants/common.constant";

export const BASE_URL = "/setting";

const getSettingsRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: (
        <>
          Setting Page <Outlet />
        </>
      ),
      icon: <Settings />,
      showOnSideNav: true,
      label: "Setting",
      key: "setting",
      handle: {
        identifier: "root",
      },
      accessible_roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN], // only to accessible_roles by admin and super admin
    },
  ];

  return routes;
};

export default getSettingsRoutes;
