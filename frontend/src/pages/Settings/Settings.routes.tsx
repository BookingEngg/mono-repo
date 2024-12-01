import React from "react";
import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";
import SettingsIcon from "@/atoms/icons/Settings";

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
      icon: <SettingsIcon />,
      showOnSideNav: true,
      label: "Setting",
      key: "setting",
    },
  ];

  return routes;
};

export default getSettingsRoutes;
