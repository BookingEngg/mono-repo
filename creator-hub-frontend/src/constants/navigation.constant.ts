import { CompassIcon, HouseIcon, UserRoundIcon } from "lucide-react";
import { ROUTE_PATHS } from "@/constants/common.constant";

/**
 * Shared by BottomNav (mobile) and SideNav (desktop) so both surfaces stay in
 * sync automatically when a tab is added, renamed, or reordered.
 */
export const NAV_ITEMS = [
  { to: ROUTE_PATHS.HOME, label: "Home", icon: HouseIcon, end: true },
  { to: ROUTE_PATHS.EXPLORE, label: "Explore", icon: CompassIcon, end: false },
  { to: ROUTE_PATHS.PROFILE, label: "Profile", icon: UserRoundIcon, end: false },
];
