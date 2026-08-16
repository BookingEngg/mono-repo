// Modules
import { Link, NavLink } from "react-router-dom";
// Utils
import { cn } from "@/lib/utils";
// Constants
import { NAV_ITEMS } from "@/constants/navigation.constant";
import { ROUTE_PATHS } from "@/constants/common.constant";

/**
 * Persistent left rail shown from the md breakpoint up, replacing BottomNav so
 * three tabs don't end up stretched thin across a wide viewport.
 */
const SideNav = () => {
  return (
    <aside className="border-border bg-background hidden w-60 shrink-0 flex-col gap-6 border-r p-4 md:sticky md:top-0 md:flex md:h-svh">
      <Link
        to={ROUTE_PATHS.HOME}
        className="flex items-center gap-2 px-2 font-semibold"
      >
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm">
          CH
        </span>
        Creator Hub
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SideNav;
