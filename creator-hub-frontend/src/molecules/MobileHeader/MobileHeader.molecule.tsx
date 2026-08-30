// Modules
import { NavLink, matchPath, useLocation } from "react-router-dom";
// Atoms
import { Avatar, AvatarFallback, AvatarImage } from "@/atoms/ui/avatar";
// Store
import { getAuthUser } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
// Utils
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/util";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
import { PROFILE_NAV_ITEM } from "@/constants/navigation.constant";

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
 *
 * Profile lives here in the top right rather than in BottomNav, which frees a
 * bottom tab slot and matches where an account avatar is normally expected on
 * mobile.
 */
const MobileHeader = () => {
  const location = useLocation();
  const { user } = useAppSelector(getAuthUser);

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <header className="border-border bg-background sticky top-0 z-40 flex items-center justify-between gap-3 border-b px-4 py-3 md:hidden">
      <h1 className="truncate font-semibold">
        {getPageTitle(location.pathname)}
      </h1>

      <NavLink
        to={PROFILE_NAV_ITEM.to}
        end={PROFILE_NAV_ITEM.end}
        aria-label={PROFILE_NAV_ITEM.label}
        className={({ isActive }) =>
          cn(
            "shrink-0 rounded-full ring-offset-2 transition-shadow",
            // The avatar has no label next to it, so the active tab needs a
            // visible ring — there's nothing else to mark it as current.
            isActive && "ring-foreground ring-2",
          )
        }
      >
        <Avatar className="size-8">
          {/*
            Google's photo CDN rejects requests carrying this page's referrer,
            so initials would show forever without an explicit no-referrer.
          */}
          <AvatarImage
            src={user?.user_profile_picture}
            alt={fullName}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="text-xs">
            {getInitials(user?.first_name, user?.last_name)}
          </AvatarFallback>
        </Avatar>
      </NavLink>
    </header>
  );
};

export default MobileHeader;
