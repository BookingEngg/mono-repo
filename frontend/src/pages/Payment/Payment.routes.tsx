import React from "react";
import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";
import Payment from "@/atoms/icons/Payment";

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
      icon: <Payment />,
      showOnSideNav: true,
      key: "payment",
      label: "Payment",
      handle: { identifier: "root" },
      children: [
        {
          path: `${BASE_URL}/upi`,
          element: <>UPI</>,
          label: "UPI",
          key: "upi-payment",
          showOnTab: true,
          handle: { 
            identifier: "upi"
          },
        },
        {
          path: `${BASE_URL}/net-banking`,
          element: <>Netbanking</>,
          label: "Netbanking",
          key: "net-banking",
          showOnTab: true,
          handle: {
            identifier: "net-banking",
          },
        },
      ],
    },
  ];

  return routes;
};

export default getPaymentRoutes;
