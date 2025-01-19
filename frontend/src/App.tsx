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
import PaymentRoutes from "@/pages/Payment/Payment.routes";
import SettingsRoutes from "./pages/Settings";
// Layout
import MainLayout from "@/layout/MainLayout";
// Store
import { useAppSelector } from "./store/hooks";
import { isUserAuthorized } from "./store/auth";
// Context Provider
import CurrentRouteContext from "@/contextProvider/routeContext";
// Typings
import { TRoutes } from "@/typings/common";

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
  const isAuthorized = useAppSelector(isUserAuthorized);

  // Contain all pages routes
  const loginRoutes = [...LoginRoutes()];
  const authorizedRoutes = [...PaymentRoutes(), ...SettingsRoutes()];

  const flatternLoginRoutesTree = React.useMemo(() => {
    return flatternRoutes(loginRoutes);
  }, [loginRoutes]);

  const flatternAuthorizedRoutesTree = React.useMemo(() => {
    return flatternRoutes(authorizedRoutes);
  }, [authorizedRoutes]);

  // Return the current working route on location
  const getCurrentRoute = React.useMemo(() => {
    const currentRoute = [
      ...flatternLoginRoutesTree,
      ...flatternAuthorizedRoutesTree,
    ].find((route) => {
      return route.path === location.pathname;
    });

    return currentRoute || flatternLoginRoutesTree[0];
  }, [flatternLoginRoutesTree, flatternAuthorizedRoutesTree, location]);

  if (!isUserAuthorized) {
    navigate("/login");
  }

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
