// Modules
import { Link } from "react-router-dom";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";

/**
 * Mobile-only top bar mirroring SideNav's brand block, since below the md
 * breakpoint SideNav is hidden entirely and BottomNav carries the actual
 * navigation — without this the top of the screen was just empty space.
 */
const MobileHeader = () => {
  return (
    <header className="border-border bg-background sticky top-0 z-40 flex items-center border-b px-4 py-3 md:hidden">
      <Link
        to={ROUTE_PATHS.HOME}
        className="flex items-center gap-2 font-semibold"
      >
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm">
          CH
        </span>
        Creator Hub
      </Link>
    </header>
  );
};

export default MobileHeader;
