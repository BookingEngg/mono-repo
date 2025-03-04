import { TRoutes } from "@/typings/common";
import React from "react";
import { FlexboxGrid, Text } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
// Style
import style from "./PageNavigation.module.scss";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(style);

interface IPageNavigationTabGroupType {
  currentRoute?: TRoutes;
}

const PageNavigationTabGroup = (props: IPageNavigationTabGroupType) => {
  const { currentRoute } = props;
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState("");
  const [currentRouteImmediateParent, setCurrentRouteImmediateParent] =
    React.useState<TRoutes | undefined>(undefined);

  React.useEffect(() => {
    if (currentRoute) {
      setCurrentRouteImmediateParent(currentRoute.parent);
      const validTopNavRoutes =
        currentRoute.children?.filter((tempRoute) => !!tempRoute.showOnTab) ||
        [];
      if (validTopNavRoutes?.[0]) {
        navigate(validTopNavRoutes[0].path);
        setSelectedTab(validTopNavRoutes[0].key)
      }
    }
  }, [currentRoute]);

  const validRoutesForTopNav = React.useMemo(() => {
    return currentRouteImmediateParent?.children?.length
      ? currentRouteImmediateParent?.children.filter(
          (route) => !!route.showOnTab
        )
      : [];
  }, [currentRouteImmediateParent]);

  const handleTabChange = React.useCallback(
    (tabRoute: TRoutes) => {
      setSelectedTab(tabRoute.key);
      navigate(tabRoute.path);
    },
    [selectedTab, validRoutesForTopNav, currentRoute]
  );

  if (!currentRoute || !validRoutesForTopNav.length) return <></>;

  return (
    <FlexboxGrid className={cx("top-nav-container")}>
      {validRoutesForTopNav.map((route, index) => (
        <FlexboxGridItem
          id={`top-nav-container-item-${index + 1}`}
          className={cx([
            "top-nav-container-item",
            `${selectedTab === route.key ? "selected" : "unselected"}-top-nav-container-item`,
          ])}
          onClick={() => {
            handleTabChange(route);
          }}
        >
          <Text weight="semibold">{route.label}</Text>
        </FlexboxGridItem>
      ))}
    </FlexboxGrid>
  );
};

export default PageNavigationTabGroup;
