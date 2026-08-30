// Modules
import { Link, NavLink } from "react-router-dom";
// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
// Utils
import { cn } from "@/lib/utils";
// Constants
import { NAV_ITEMS, PROFILE_NAV_ITEM } from "@/constants/navigation.constant";
import { ROUTE_PATHS } from "@/constants/common.constant";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

/**
 * Persistent left rail shown from the md breakpoint up, replacing BottomNav so
 * tabs don't end up stretched thin across a wide viewport. Renders NAV_ITEMS
 * in order (Home, Explore, Applications, Profile), gating any tab that
 * carries a `privilege`, then the brand-only "Post a job" action last.
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
        {/*
          Profile is appended rather than living in NAV_ITEMS because the
          mobile bottom bar deliberately omits it (it sits in the header's top
          right there). Appending keeps the desktop rail's order unchanged.
        */}
        {[...NAV_ITEMS, PROFILE_NAV_ITEM].map(
          ({ to, label, icon: Icon, end, privilege }) => {
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
          },
        )}

        {/* Brand-only, so it stays invisible to a plain creator account */}
        {/* <RequireAccess privilege={BRAND_NAV_ITEM.privilege}>
          <NavLink to={BRAND_NAV_ITEM.to} className={navLinkClassName}>
            <BRAND_NAV_ITEM.icon className="size-5" />
            {BRAND_NAV_ITEM.label}
          </NavLink>
        </RequireAccess> */}
      </nav>
    </aside>
  );
};

export default SideNav;
