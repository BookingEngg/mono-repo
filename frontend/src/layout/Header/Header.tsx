import { TRoutes } from "@/typings/common";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "rsuite";
import CurrentRouteContext from "@/contextProvider/routeContext";

const Header = () => {
  const { currentRoute: selectedRoute } = useContext(CurrentRouteContext);
  if (!selectedRoute) {
    return <></>;
  }

  const navigate = useNavigate();
  const validAvailableTabs = React.useMemo(() => {
    const { handle } = selectedRoute;
    if (handle?.identifier === "root") {
      return selectedRoute;
    }
    return selectedRoute.parent || selectedRoute;
  }, [selectedRoute]);

  const validRoutesForNav: TRoutes[] =
    React.useMemo(() => {
      return (
        validAvailableTabs.children?.filter((route) => !!route.showOnTab) || []
      );
    }, [selectedRoute, validAvailableTabs]) || [];

  React.useEffect(() => {
    console.log("USE>>>>", validRoutesForNav);
    navigate(validRoutesForNav?.[0]?.path);
  }, []);

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
