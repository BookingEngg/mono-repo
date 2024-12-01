import React from "react";
import { TRoutes } from "@/typings/common";
import { Nav, Sidenav } from "rsuite";
import { Location, Route, useNavigate } from "react-router-dom";

const SideNav = (props: { routes: TRoutes[], selectedRoute: Location; }) => {
  const navigate = useNavigate();
  const [expand, setExpand] = React.useState(false);
  const [navWidth, setNavWidth] = React.useState(40);
  const { routes, selectedRoute } = props;

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
            <Nav.Item style={{ textAlign: "center" }} >Home</Nav.Item>
            {routes.map((route) => {
              if (!route.showOnSideNav) {
                return <></>;
              }

              if (route.children) {
                return (
                  <Nav.Menu
                    key={route.key}
                    eventKey={route.key}
                    icon={
                      <span className={expand ? "" : "rs-icon"}>
                        {route.icon}
                      </span>
                    }
                    title={route.label}
                  >
                    <SubTabRender routes={route.children} navigate={navigate} selectedRoute={selectedRoute}/>
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
                    if (!route.children?.length) {
                      navigate(route.path);
                    }
                  }}
                  active={selectedRoute.pathname === route.path}
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
  selectedRoute: Location
}) => {
  const { routes, navigate, selectedRoute } = props;

  return routes.map((route) => (
    <Nav.Item
      eventKey={route.key}
      icon={<span className="rs-icon">{route.icon}</span>}
      onClick={() => {
        if (!route.children?.length) {
          navigate(route.path);
        }
      }}
      active={selectedRoute.pathname === route.path}
    >
      {route.label}
    </Nav.Item>
  ));
};

export default SideNav;
