import {
  ClipboardListIcon,
  CompassIcon,
  HouseIcon,
  PlusIcon,
  UserRoundIcon,
} from "lucide-react";
import { ROUTE_PATHS } from "@/constants/common.constant";
import { PRIVILEGES } from "@/constants/access.constant";

/**
 * Shared by BottomNav (mobile) and SideNav (desktop) so both surfaces stay in
 * sync automatically when a tab is added, renamed, or reordered. `privilege`
 * restricts a tab to creators with that privilege (e.g. Applications is
 * influencer-only) — omit it for tabs everyone sees.
 */
export const NAV_ITEMS = [
  { to: ROUTE_PATHS.HOME, label: "Home", icon: HouseIcon, end: true },
  { to: ROUTE_PATHS.EXPLORE, label: "Explore", icon: CompassIcon, end: false },
  {
    to: ROUTE_PATHS.MY_APPLICATIONS,
    label: "Applications",
    icon: ClipboardListIcon,
    end: false,
    privilege: PRIVILEGES.APPLY_JOBS,
  },
  { to: ROUTE_PATHS.PROFILE, label: "Profile", icon: UserRoundIcon, end: false },
];

// Rendered only in SideNav, past the main tabs — a brand's "post a job"
// action, not a primary navigation destination shared with BottomNav.
export const BRAND_NAV_ITEM = {
  to: ROUTE_PATHS.CREATE_JOB,
  label: "Post a job",
  icon: PlusIcon,
  privilege: PRIVILEGES.CREATE_JOBS,
};
