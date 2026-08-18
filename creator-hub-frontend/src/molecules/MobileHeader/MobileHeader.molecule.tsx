// Modules
import { matchPath, useLocation } from "react-router-dom";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";

const PAGE_TITLES: { path: string; label: string }[] = [
  { path: ROUTE_PATHS.HOME, label: "Welcome to Creator Hub" },
  { path: ROUTE_PATHS.EXPLORE, label: "Explore Jobs" },
  { path: ROUTE_PATHS.MY_APPLICATIONS, label: "Job Applications" },
  { path: ROUTE_PATHS.PROFILE, label: "Profile" },
  { path: ROUTE_PATHS.CREATE_JOB, label: "Post a job" },
];

const getPageTitle = (pathname: string): string =>
  PAGE_TITLES.find(({ path }) => matchPath({ path, end: true }, pathname))
    ?.label ?? "Creator Hub";

/**
 * Mobile-only top bar — below the md breakpoint SideNav's persistent brand
 * block is hidden, so this shows the current tab's name instead (the Home
 * tab gets a dedicated welcome line rather than just saying "Home").
 */
const MobileHeader = () => {
  const location = useLocation();

  return (
    <header className="border-border bg-background sticky top-0 z-40 flex items-center border-b px-4 py-3 md:hidden">
      <h1 className="font-semibold">{getPageTitle(location.pathname)}</h1>
    </header>
  );
};

export default MobileHeader;
