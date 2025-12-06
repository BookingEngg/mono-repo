import { TRoutes } from "@/typings/common";
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
      showOnSideNav: false,
      showOnTab: false,
      key: "login",
      label: "Login",
      accessible: ["roles/users", "roles/admin", "roles/super-admin"],
    },
  ];

  return routes;
};

export default getLoginRoutes;
