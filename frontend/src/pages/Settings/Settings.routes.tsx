// Icons
import { Settings } from "lucide-react";
// Typings
import { TRoutes } from "@/typings/common";
// Constants
import { ROLES } from "@/constants/common.constant";
// Pages
import SettingPage from "./Settings.page";
// Organism
import GroupOrganism from "@/organism/Settings/Groups";

export const BASE_URL = "/setting";

const getSettingsRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: <SettingPage />,
      icon: <Settings />,
      showOnSideNav: false,
      showOnTab: false,
      label: "Setting",
      key: "setting",
      handle: {
        identifier: "root",
      },
      accessible_roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN], // only to accessible_roles by admin and super admin
      children: [
        {
          path: `${BASE_URL}/groups`,
          element: <GroupOrganism />,
          showOnSideNav: false,
          showOnTab: true,
          key: "groups",
          label: "Groups",
          accessible_roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        },
        {
          path: `${BASE_URL}/roles-management`,
          element: <>Role Management</>,
          showOnSideNav: false,
          showOnTab: true,
          key: "roles-management",
          label: "Roles Management",
          accessible_roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        },
      ],
    },
  ];

  return routes;
};

export default getSettingsRoutes;
