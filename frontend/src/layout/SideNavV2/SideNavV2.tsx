import React from "react";
import { TRoutes } from "@/typings/common";
import { FlexboxGrid, Nav, Sidenav, Text } from "rsuite";
import { Link, useNavigate } from "react-router-dom";
import "./SideNav.scss";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import DropDown from "@/atoms/icons/DropDown";

export interface SideNavProps {
  routes: TRoutes[];
  selectedRoute: TRoutes;
}

const SideNavV2 = (props: SideNavProps) => {
  const { routes, selectedRoute } = props;

  //states
  const [expanded, setExpanded] = React.useState(true);

  const validRoutesForNav =
    React.useMemo(() => {
      return routes.filter((route) => !!route.showOnSideNav);
    }, [routes]) || [];

  if (!expanded) {
    return (
      <div className="sidenav-container sidenav-not-expanded">
        <nav
          onMouseEnter={() => {
            setExpanded(true);
          }}
          onMouseLeave={() => {
            setExpanded(false);
          }}
        >
          <div className="sidenav-item-container">
            {validRoutesForNav.map((route) => {
              // ${selectedRoute.key === route.key ? 'selected-menuitem' : ''
              // this code is work only for routes who does not have any child
              return (
                <div className={`sidenav-iconholder ${selectedRoute.key === route.key ? 'selected-menuitem' : ''}`}>
                  <span>{route.icon}</span>
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="sidenav-container">
      <nav
        onMouseEnter={() => {
          setExpanded(true);
        }}
        onMouseLeave={() => {
          setExpanded(false);
        }}
      >
        <ExpandedSideNav
          routes={validRoutesForNav}
          selectedRoute={selectedRoute}
        />
      </nav>
    </div>
  );
};

const ExpandedSideNav = (props: {
  routes: TRoutes[];
  selectedRoute: TRoutes;
}) => {
  const { routes, selectedRoute } = props;
  const navigate = useNavigate();

  const [selectedSubTab, setSelectedSubTab] = React.useState("");

  const selectedTabHandler = (route: TRoutes) => {
    if (!route.children?.length) {
      navigate(route.path);
    } else {
      if (selectedSubTab === route.key) {
        setSelectedSubTab("");
      } else {
        setSelectedSubTab(route.key);
      }
    }
  };

  return (
    <div className="sidenav-item-container">
      {routes.map((route) => {
        return (
          <div className="sidenav-item-container">
            <FlexboxGrid
              className="menuitem-holder"
              align="middle"
              onClick={() => {
                selectedTabHandler(route);
              }}
            >
              {route.icon}
              <Text
                size="lg"
                className={
                  selectedRoute.key === route.key ? "selected-menuitem" : ""
                }
              >
                {route.label}
              </Text>
              {route.children?.length ? (
                <DropDown rotate="bottom" fillPath="#686868" />
              ) : (
                <></>
              )}
            </FlexboxGrid>

            {route.children?.length && selectedSubTab === route.key ? (
              <div
                className="submenuitem-holder"
                style={{ height: route.children.length * 44 }}
              >
                {route.children.map((route, index) => {
                  return (
                    <Link to={route.path} key={`submenu-item-${index}`}>
                      <FlexboxGrid
                        as="div"
                        justify="space-between"
                        align="middle"
                      >
                        <Text
                          className={
                            selectedRoute.key === route.key
                              ? "selected-menuitem"
                              : ""
                          }
                        >
                          {route.label}
                        </Text>
                      </FlexboxGrid>
                    </Link>
                  );

                  return <></>;
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SideNavV2;
