import { TRoutes } from "@/typings/common";
import { Login } from "@/organism/Login";
import { Outlet } from "react-router-dom";

export const BASE_URL = "/login";

// This route is visible to all the users when non logged in
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
      showOnSideNav: false,
      showOnTab: false,
      key: "login",
      label: "Login",
    },
  ];

  return routes;
};

export default getLoginRoutes;
