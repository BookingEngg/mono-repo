// Modules
import React from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
// Pages
import LoginRoutes from "@/pages/Login/Login.routes";
import PaymentRoutes from "@/pages/Payment/Payment.routes";
import SettingsRoutes from "./pages/Settings";
// Layout
import MainLayout from "@/layout/MainLayout";
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
  const location = useLocation();

  // Contain all pages routes
  const allRoutes: TRoutes[] = [
    ...LoginRoutes(),
    ...PaymentRoutes(),
    ...SettingsRoutes(),
  ];

  const flatternRoutesTree = React.useMemo(() => {
    return flatternRoutes(allRoutes);
  }, [allRoutes]);

  // Return the current working route on location
  const getCurrentRoute = React.useMemo(() => {
    const currentRoute = flatternRoutesTree.find((route) => {
      return route.path === location.pathname;
    });

    return currentRoute || flatternRoutesTree[0];
  }, [allRoutes, location]);

  return (
    <>
      <CurrentRouteContext.Provider value={{ currentRoute: getCurrentRoute }}>
        <MainLayout
          routes={allRoutes}
          childrens={
            <>
              <Outlet />
              <Routes>{getAllRoutes(allRoutes)}</Routes>
            </>
          }
        />
      </CurrentRouteContext.Provider>
    </>
  );
}
export default App;
