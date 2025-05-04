import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";
import { Settings } from "lucide-react";

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
    },
  ];

  return routes;
};

export default getSettingsRoutes;
