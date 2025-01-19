import { TRoutes } from "@/typings/common";
import Payment from "@/atoms/icons/Payment";
// Organism
import { Login } from "@/organism/Login";
import { Outlet } from "react-router-dom";

export const BASE_URL = "/login";

const getLoginRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: (
        <>
          <Outlet />
          <Login />
        </>
      ),
      icon: <Payment />,
      showOnSideNav: true,
      key: "login",
      label: "Login",
    },
  ];

  return routes;
};

export default getLoginRoutes;
