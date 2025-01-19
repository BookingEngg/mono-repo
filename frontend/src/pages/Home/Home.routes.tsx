import { Outlet } from "react-router-dom";
import { TRoutes } from "@/typings/common";
import Payment from "@/atoms/icons/Payment";

export const BASE_URL = "/";

const getHomeRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: (
        <>
          Home Page <Outlet />
        </>
      ),
      icon: <Payment />,
      showOnSideNav: true,
      key: "home",
      label: "Home",
      handle: { identifier: "root" },
    },
  ];

  return routes;
};

export default getHomeRoutes;
