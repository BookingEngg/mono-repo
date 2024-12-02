import { TRoutes } from "@/typings/common";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "rsuite";

const Header = (props: { routes: TRoutes[]; selectedRoute: TRoutes }) => {
  const navigate = useNavigate();
  const { selectedRoute } = props;

  const validAvailableTabs = React.useMemo(() => {
    const { handle } = selectedRoute;
    if (handle?.identifier === "root") {
      return selectedRoute;
    }
    return selectedRoute.parent || selectedRoute;
  }, [selectedRoute]);

  const validRoutesForNav: TRoutes[] =
    React.useMemo(() => {
      const allValidRoutes =
        validAvailableTabs.children?.filter((route) => !!route.showOnTab) || [];
      navigate(
        allValidRoutes.length ? allValidRoutes[0].path : selectedRoute.path
      );

      return allValidRoutes;
    }, [selectedRoute, validAvailableTabs]) || [];

  return (
    <Nav appearance="subtle" defaultActiveKey={validRoutesForNav?.[0]?.key}>
      {validRoutesForNav.map((route) => {
        return (
          <Nav.Item
            eventKey={route.key}
            onClick={() => {
              navigate(route.path);
            }}
          >
            {route.label}
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default Header;
