import React from "react";
import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";
import Payment from "@/atoms/icons/Payment";
import LoginOrganism from "@/organism/Login";

export const BASE_URL = "/login";

const getLoginRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: (
        <>
          <Outlet />
        </>
      ),
      icon: <Payment />,
      showOnSideNav: true,
      key: "login",
      label: "Login",
      children: [
        {
          path: `${BASE_URL}/otp`,
          element: <><LoginOrganism /></>,
          label: "Login Otp",
          key: "login-otp",
          showOnSideNav: true,
        },
      ],
    },
  ];

  return routes;
};

export default getLoginRoutes;
