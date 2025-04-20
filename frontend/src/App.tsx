// Modules
import React from "react";
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
// Pages
import LoginRoutes from "@/pages/Login/Login.routes";
import HomeRoutes from "@/pages/Home/Home.routes";
import Community from "@/pages/Community";
import ChatRoutes from "@/pages/Chat";
import SettingsRoutes from "@/pages/Settings";
// Services
import { getUser } from "@/services/Login.service";
// Layout
import MainLayout from "@/layout/MainLayout";
// Store
import { isUserAuthorized, login } from "./store/auth";
import { useAppDispatch } from "./store/hooks";
// Context Provider
import CurrentRouteContext from "@/contextProvider/routeContext";
// Typings
import { TRoutes } from "@/typings/common";
import { useSelector } from "react-redux";
// Style
import "./App.css";

/**
 * Get all the routes passing in the routes parameter
 */
const getAllRoutes = (routes: TRoutes[]) => {
  return routes.map((route) => (
    <Route key={route.key} path={route.path} element={route.element}>
      {route.children && getAllRoutes(route.children)}
    </Route>
  ));
};

/**
 * Flatten the route tree into one dimension array
 */
const flatternRoutes = (routes: TRoutes[]): TRoutes[] => {
  let flatRoutes: TRoutes[] = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    if (route.children) {
      flatRoutes.push(route);
      route.children = route.children.map((child) => {
        return {
          ...child,
          parent: route,
        };
      });
      flatRoutes = [...flatRoutes, ...flatternRoutes(route.children)];
    } else {
      flatRoutes.push(route);
    }
  }

  return flatRoutes;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthorized = useSelector(isUserAuthorized);

  //User Authorized check
  React.useEffect(() => {
    const validateAuthorizedUser = async () => {
      const userResponse = await getUser();
      if (userResponse.status) {
        dispatch(login({ user: userResponse.user, isAuthorized: true }));
        if (!!userResponse?.user?._id) {
          // If website refresh and user is authorized then navigate to same page
          navigate(location.pathname);
        }
      }
    };
    validateAuthorizedUser();
  }, []);

  // Contain all pages routes
  const loginRoutes = [...LoginRoutes()];
  const authorizedRoutes = [
    ...HomeRoutes(),
    ...Community(),
    ...ChatRoutes(),
    ...SettingsRoutes(),
  ];

  const flatternLoginRoutesTree = React.useMemo(() => {
    return flatternRoutes(loginRoutes);
  }, [loginRoutes]);

  const flatternAuthRoutesTree = React.useMemo(() => {
    return flatternRoutes(authorizedRoutes);
  }, [authorizedRoutes]);

  // Return the current working route on location
  const getCurrentRoute = React.useMemo(() => {
    const currentRoute = [
      ...(isAuthorized ? flatternAuthRoutesTree : flatternLoginRoutesTree),
    ].find((route) => {
      return route.path === location.pathname;
    });

    if (!currentRoute) {
      const defaultCurrentRoute = isAuthorized
        ? flatternAuthRoutesTree[0]
        : flatternLoginRoutesTree[0];

      navigate(defaultCurrentRoute.path);
      return defaultCurrentRoute;
    }

    return currentRoute;
  }, [flatternAuthRoutesTree, flatternLoginRoutesTree, location]);

  React.useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
    }
  }, [isAuthorized]);

  return (
    <>
      <CurrentRouteContext.Provider value={{ currentRoute: getCurrentRoute }}>
        {isAuthorized ? (
          <MainLayout
            routes={authorizedRoutes}
            childrens={
              <>
                <Outlet />
                <Routes>{getAllRoutes(authorizedRoutes)}</Routes>
              </>
            }
          />
        ) : (
          <MainLayout
            routes={loginRoutes}
            childrens={
              <>
                <Outlet />
                <Routes>{getAllRoutes(loginRoutes)}</Routes>
              </>
            }
          />
        )}
      </CurrentRouteContext.Provider>
    </>
  );
}
export default App;
