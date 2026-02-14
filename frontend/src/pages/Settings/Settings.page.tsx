// Modules
import { Outlet } from "react-router-dom";
import { useContext } from "react";
// Atoms
import PageNavigationTabGroup from "@/atoms/PageNavigationTab";
// Context Provider
import CurrentRouteContext from "@/contextProvider/routeContext";
// Rsuite
import { FlexboxGrid } from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";

const SettingPage = () => {
  const { currentRoute: selectedRoute } = useContext(CurrentRouteContext);

  return (
    <FlexboxGrid>
      <FlexboxGridItem colspan={24}>
        <PageNavigationTabGroup currentRoute={selectedRoute} />
      </FlexboxGridItem>

      <FlexboxGridItem colspan={24}>
        <Outlet />
      </FlexboxGridItem>
    </FlexboxGrid>
  );
};

export default SettingPage;

