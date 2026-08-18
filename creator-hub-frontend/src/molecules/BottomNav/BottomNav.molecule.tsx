// Modules
import { NavLink } from "react-router-dom";
// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
// Utils
import { cn } from "@/lib/utils";
// Constants
import { NAV_ITEMS } from "@/constants/navigation.constant";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
    isActive
      ? "text-foreground"
      : "text-muted-foreground hover:text-foreground"
  );

/**
 * Fixed bottom tab bar, mobile only — SideNav takes over from the md
 * breakpoint up, where spreading tabs across the full width reads as sparse
 * rather than a real navigation bar. Tabs render in NAV_ITEMS order (Home,
 * Explore, Applications, Profile); a tab with a `privilege` is wrapped in
 * RequireAccess so it stays invisible to accounts that can't use it.
 */
const BottomNav = () => {
  return (
    <nav className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, privilege }) => {
          const link = (
            <NavLink key={to} to={to} end={end} className={navLinkClassName}>
              <Icon className="size-5" />
              {label}
            </NavLink>
          );

          return privilege ? (
            <RequireAccess key={to} privilege={privilege}>
              {link}
            </RequireAccess>
          ) : (
            link
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
