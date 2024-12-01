import React from "react";
import { TRoutes } from "@/typings/common";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
import { useLocation } from "react-router-dom";

const flatternRoutes = (routes: TRoutes[]): TRoutes[] => {
  let flatRoutes: TRoutes[] = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];

    if (route.children) {
      flatRoutes.push(route);
      flatRoutes = [...flatRoutes, ...flatternRoutes(route.children)];
    } else {
      flatRoutes.push(route);
    }
  }

  return flatRoutes;
};

const MainLayout = (props: { routes: TRoutes[] }) => {
  const { routes } = props;
  const location = useLocation();

  const flatternRoutesTree = React.useMemo(() => {
    return flatternRoutes(routes);
  }, [routes]);

  const getCurrentRoute = () => React.useCallback(() => {
    const currentRoute = flatternRoutesTree.find(route => {
      return route.path === location.pathname
    })

    console.log(currentRoute)

  }, [routes, location])

  return (
    <>
      {/* <SideNav routes={routes} selectedRoute={location} />
      <Header routes={routes} selectedRoute={location} /> */}
    </>
  );
};

export default MainLayout;
