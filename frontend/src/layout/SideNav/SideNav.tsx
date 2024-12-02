import React from "react";
import { TRoutes } from "@/typings/common";
import { Nav, Sidenav } from "rsuite";
import { useNavigate } from "react-router-dom";

export interface SideNavProps {
  routes: TRoutes[];
  selectedRoute: TRoutes;
}

const SideNav = (props: SideNavProps) => {
  const { routes, selectedRoute } = props;

  //states
  const navigate = useNavigate();
  const [expand, setExpand] = React.useState(false);
  const [navWidth, setNavWidth] = React.useState(40);

  const validRoutesForNav =
    React.useMemo(() => {
      return routes.filter((route) => !!route.showOnSideNav);
    }, [routes]) || [];

  return (
    <div
      className="navbar-container"
      style={{
        display: "inline-table",
        marginRight: 10,
        width: navWidth,
      }}
      onMouseEnter={() => {
        setExpand(true);
        setNavWidth(240);
      }}
      onMouseLeave={() => {
        setExpand(false);
        setNavWidth(40);
      }}
    >
      <Sidenav appearance={"default"} expanded={expand}>
        <Sidenav.Body>
          <Nav key="side-nav">
            <Nav.Item
              key="customer_info"
              eventKey={"info"}
              style={{ height: 45 }}
              active={false}
            >
              {" "}
            </Nav.Item>
            {validRoutesForNav.map((route) => {
              if (route.children && route.children.filter(child => child.showOnSideNav).length) {
                return (
                  <Nav.Menu
                    key={route.key}
                    eventKey={route.key}
                    icon={<span className={"rs-icon"}>{route.icon}</span>}
                    title={route.label}
                  >
                    <SubTabRender
                      routes={route.children}
                      navigate={navigate}
                      selectedRoute={selectedRoute}
                    />
                  </Nav.Menu>
                );
              }

              return (
                <Nav.Item
                  key={route.key}
                  eventKey={route.key}
                  icon={
                    <span className={expand ? "" : "rs-icon"}>
                      {route.icon}
                    </span>
                  }
                  style={{ paddingLeft: 20 }}
                  onClick={() => {
                    navigate(route.path);
                  }}
                  active={route.key === selectedRoute.key}
                >
                  {route.label}
                </Nav.Item>
              );
            })}
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
};

const SubTabRender = (props: {
  routes: TRoutes[];
  navigate: (path: string) => void;
  selectedRoute: TRoutes;
}) => {
  const { routes, navigate, selectedRoute } = props;

  const validRoutesForNav = React.useMemo(() => {
    return routes.filter((route) => !!route.showOnSideNav);
  }, [routes]);

  return validRoutesForNav.map((route) => (
    <Nav.Item
      eventKey={route.key}
      onClick={() => {
        if (!route.children?.length) {
          navigate(route.path);
        }
      }}
      active={selectedRoute.key === route.key}
    >
      {route.label}
    </Nav.Item>
  ));
};

export default SideNav;
