import React, { useReducer } from "react";
import { Connect, useSelector, useDispatch } from "react-redux";
import { TRoutes } from "@/typings/common";
import SideNav from "@/layout/SideNav";
import SideNavV2 from "@/layout/SideNavV2";
import Header from "@/layout/Header";
import { useLocation } from "react-router-dom";
import { FlexboxGrid } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { createContext } from "react";
import { RootState } from "@/store";
import { incrementByValue } from "@/store/auth";

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

const MainLayout = (props: { routes: TRoutes[] }) => {
  const { routes } = props;
  const location = useLocation();

  const flatternRoutesTree = React.useMemo(() => {
    return flatternRoutes(routes);
  }, [routes]);

  const getCurrentRoute = React.useMemo(() => {
    const currentRoute = flatternRoutesTree.find((route) => {
      return route.path === location.pathname;
    });

    return currentRoute || flatternRoutesTree[0];
  }, [routes, location]);

  const count = useSelector((state: RootState) => state.user.value);
  const dispatch = useDispatch()

  return (
    <>
      {/* {count} */}
      {/* <section>
        <SideNavV2 routes={routes} selectedRoute={getCurrentRoute} />
        <Header routes={routes} selectedRoute={getCurrentRoute} />
      </section> */}
      {/* <button onClick={()=> {dispatch(incrementByValue(4))}}>Click me</button> */}

      <FlexboxGrid>
        <FlexboxGridItem colspan={2}>
          <SideNavV2 routes={routes} selectedRoute={getCurrentRoute} />
        </FlexboxGridItem>
        <FlexboxGridItem colspan={22}>
          <FlexboxGrid>
            <FlexboxGridItem colspan={24}>
              <Header routes={routes} selectedRoute={getCurrentRoute} />
            </FlexboxGridItem>
            {/* <FlexboxGridItem>
              BODY
            </FlexboxGridItem> */}
          </FlexboxGrid>
        </FlexboxGridItem>
      </FlexboxGrid>
    </>
  );
};

export default MainLayout;
