import React from "react";
import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";

export const BASE_URL = "/pmt";

const getPaymentRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: (
        <>
          Payment Page <Outlet />
        </>
      ),
    },
  ];

  return routes;
};

export default getPaymentRoutes;
