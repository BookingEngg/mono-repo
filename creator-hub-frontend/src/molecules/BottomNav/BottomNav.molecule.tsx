// Modules
import { NavLink } from "react-router-dom";
// Utils
import { cn } from "@/lib/utils";
// Constants
import { NAV_ITEMS } from "@/constants/navigation.constant";

/**
 * Fixed bottom tab bar, mobile only — SideNav takes over from the md
 * breakpoint up, where spreading three tabs across the full width reads as
 * sparse rather than a real navigation bar.
 */
const BottomNav = () => {
  return (
    <nav className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
