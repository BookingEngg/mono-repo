import React from "react";
import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";
import Profitability from "@/atoms/icons/Profitablity";

export const BASE_URL = "/login";

const getLoginRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: (
        <>
          Login Page <Outlet />
        </>
      ),
      icon: <Profitability />,
      showOnSideNav: true,
      key: "login",
      label: "Login",
      children: [
        {
          path: `${BASE_URL}/otp`,
          element: <>Login Otp</>,
          label: "Login Otp",
          key: "login-otp",
          showOnSideNav: true
        },
      ],
    },
  ];

  return routes;
};

export default getLoginRoutes;
