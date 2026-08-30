import {
  ClipboardListIcon,
  CompassIcon,
  HouseIcon,
  PlusIcon,
  UserRoundIcon,
  WalletIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTE_PATHS } from "@/constants/common.constant";
import { PRIVILEGES } from "@/constants/access.constant";

export type TNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
  /** Hides the tab from accounts without it. Omit for tabs everyone sees. */
  privilege?: string;
};

/**
 * Shared by BottomNav (mobile) and SideNav (desktop) so both surfaces stay in
 * sync automatically when a tab is added, renamed, or reordered. `privilege`
 * restricts a tab to creators with that privilege (e.g. Applications is
 * influencer-only) — omit it for tabs everyone sees.
 *
 * Profile is deliberately NOT in here: on mobile it lives in the header's top
 * right rather than the bottom tab bar. SideNav still appends it to the end
 * of this list, so the desktop rail is unchanged.
 */
export const NAV_ITEMS: TNavItem[] = [
  { to: ROUTE_PATHS.HOME, label: "Home", icon: HouseIcon, end: true },
  { to: ROUTE_PATHS.EXPLORE, label: "Explore", icon: CompassIcon, end: false },
  {
    to: ROUTE_PATHS.MY_APPLICATIONS,
    label: "Applications",
    icon: ClipboardListIcon,
    end: false,
    privilege: PRIVILEGES.APPLY_JOBS,
  },
  {
    to: ROUTE_PATHS.SETTLEMENT,
    label: "Settlement",
    icon: WalletIcon,
    end: false,
    privilege: PRIVILEGES.CREATE_JOBS,
  },
  {
    to: ROUTE_PATHS.CREATE_JOB,
    label: "Post a job",
    icon: PlusIcon,
    end: false,
    privilege: PRIVILEGES.CREATE_JOBS,
  },
];

/** Rendered top-right on mobile, appended to the rail on desktop. */
export const PROFILE_NAV_ITEM: TNavItem = {
  to: ROUTE_PATHS.PROFILE,
  label: "Profile",
  icon: UserRoundIcon,
  end: false,
};
