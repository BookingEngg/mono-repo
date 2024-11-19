import React from "react";
import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";

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
      children: [
        {
          path: `${BASE_URL}/otp`,
          element: <>Login Otp</>,
        },
      ],
    },
  ];

  return routes;
};

export default getLoginRoutes;
