import { TRoutes } from "@/typings/common";
import Payment from "@/atoms/icons/Payment";
import Home from "@/organism/Home";

export const BASE_URL = "/";

const getHomeRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: <Home />,
      icon: <Payment />,
      showOnSideNav: true,
      key: "home",
      label: "Summary",
      handle: { identifier: "root" },
    },
  ];

  return routes;
};

export default getHomeRoutes;
