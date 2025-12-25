// Modules
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
// Atoms
import DropDown from "@/atoms/icons/DropDown";
// Icons
import { LayoutDashboard } from "lucide-react";
// Typings
import { TRoutes } from "@/typings/common";
import { SideNavProps } from "./types";
// Context Provider
import CurrentRouteContext from "@/contextProvider/routeContext";
// Store
import { getAuthUser, getUserRolesAndPrivileges } from "@/store/auth";
import { useSelector } from "react-redux";
// style
import { FlexboxGrid, Text } from "rsuite";
import "./SideNav.scss";
// Utils
import { isRolesAccessibleToUser } from "@/utils/util";

const SideNav = (props: SideNavProps) => {
  const { routes } = props;
  const userRolesAndPrivileges = useSelector(getUserRolesAndPrivileges);

  const { currentRoute: selectedRoute } = useContext(CurrentRouteContext);
  if (!selectedRoute) {
    return <></>;
  }

  //states
  const [expanded, setExpanded] = React.useState(false);

  const validRoutesForNav =
    React.useMemo(() => {
      return routes.filter((route) => {
        const isRouteAccessible = isRolesAccessibleToUser(
          route.accessible_roles || [],
          userRolesAndPrivileges.roles
        );
        return !!route.showOnSideNav && isRouteAccessible;
      });
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
          <div className="sidenav-item-container" key={"sidenav-item-container"}>
            <div className="sidenav-iconholder">
              <span>
                <LayoutDashboard color="blue" />
              </span>
            </div>
            {validRoutesForNav.map((route) => {
              // ${selectedRoute.key === route.key ? 'selected-menuitem' : ''
              // this code is work only for routes who does not have any child
              return (
                <div
                  className={`sidenav-iconholder ${
                    (selectedRoute.key === route.key ||
                      selectedRoute.parent?.key === route.key) &&
                    "selected-menuitem"
                  }`}
                  key={`sidenav-iconholder-${route.key}`}
                >
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
        <ExpandedSideNav routes={validRoutesForNav} />
      </nav>
    </div>
  );
};

const ExpandedSideNav = (props: { routes: TRoutes[] }) => {
  const authUser = useSelector(getAuthUser);
  const userRolesAndPrivileges = useSelector(getUserRolesAndPrivileges);

  const { routes } = props;
  const navigate = useNavigate();

  const { currentRoute: selectedRoute } = useContext(CurrentRouteContext);
  if (!selectedRoute) {
    return <></>;
  }

  const [selectedSubTab, setSelectedSubTab] = React.useState(selectedRoute.key);

  const selectedTabHandler = (route: TRoutes) => {
    const validSubRouteForSideNav =
      route.children?.filter((route) => Boolean(route.showOnSideNav)) || [];

    // Side Nav tab not have any child tab
    if (!validSubRouteForSideNav.length) {
      setSelectedSubTab(route.key);
      navigate(route.path);
    } else {
      if (selectedSubTab === route.key) {
        setSelectedSubTab("");
      } else {
        setSelectedSubTab(route.key);
      }
    }
  };

  const validRoutesForNav =
    React.useMemo(() => {
      return routes.filter((route) => {
        const isRouteAccessible = isRolesAccessibleToUser(
          route.accessible_roles || [],
          userRolesAndPrivileges.roles
        );
        return !!route.showOnSideNav && isRouteAccessible;
      });
    }, [routes]) || [];

  return (
    <div className="sidenav-item-container">
      <div className="sidenav-item-container">
        <FlexboxGrid className={`menuitem-holder`} align="middle">
          <LayoutDashboard color="blue" />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Text size="xl" weight="bold">
            {authUser?.user?.first_name
              ? `Hi, ${authUser?.user?.first_name}`
              : "Dashboard"}
          </Text>
        </FlexboxGrid>
      </div>
      {validRoutesForNav.map((route) => {
        const validSubRouteForSideNav = route.children?.filter((route) => {
          const isRouteAccessible = isRolesAccessibleToUser(
            route.accessible_roles || [],
            userRolesAndPrivileges.roles
          );
          return Boolean(route.showOnSideNav) && isRouteAccessible;
        });

        return (
          <div className={`sidenav-item-container`}>
            <FlexboxGrid
              className={`menuitem-holder ${
                (selectedSubTab === route.key ||
                  selectedRoute.parent?.key === route.key) &&
                "selected-menuitem"
              }`}
              align="middle"
              onClick={() => {
                selectedTabHandler(route);
              }}
            >
              {route.icon}&nbsp;&nbsp;&nbsp;&nbsp;
              <Text
                size="lg"
                className={
                  selectedRoute?.children?.length
                    ? selectedRoute.key === route.key ||
                      selectedRoute.parent?.key === route.key
                      ? "selected-menuitem-color"
                      : ""
                    : selectedSubTab === route.key ||
                        selectedRoute.parent?.key === route.key
                      ? "selected-menuitem-color"
                      : ""
                }
              >
                {route.label}
              </Text>
              <div className="dropdown-container">
                {validSubRouteForSideNav?.length ? (
                  <DropDown
                    rotate={route.key === selectedSubTab ? `top` : `bottom`}
                    fillPath="#686868"
                  />
                ) : (
                  <></>
                )}
              </div>
            </FlexboxGrid>

            {validSubRouteForSideNav?.length && selectedSubTab === route.key ? (
              <div
                className="submenuitem-holder"
                style={{ height: validSubRouteForSideNav.length * 44 }}
              >
                {validSubRouteForSideNav.map((route, index) => {
                  return (
                    <Link to={route.path} key={`submenu-item-${index}`}>
                      <FlexboxGrid
                        as="div"
                        justify="space-between"
                        align="middle"
                      >
                        <Text
                          size="lg"
                          className={
                            selectedRoute.key === route.key
                              ? "selected-menuitem-color"
                              : ""
                          }
                        >
                          {route.label}
                        </Text>
                      </FlexboxGrid>
                    </Link>
                  );
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

export default SideNav;
