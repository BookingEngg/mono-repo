import { TRoutes } from "@/typings/common";
import FriendsLogo from "@/atoms/icons/FriendsLogo";
import Community from "./Community";
import { Outlet } from "react-router-dom";

export const BASE_URL = "/community";

const getCommunityRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: <Community />,
      icon: <FriendsLogo />,
      showOnSideNav: true,
      key: "community",
      label: "Community",
      children: [
        {
          path: `${BASE_URL}/add`,
          element: <>Add New Friend</>,
          showOnSideNav: false,
          showOnTab: true,
          key: "add-new-friend",
          label: "Add New Friend",
        },
        {
          path: `${BASE_URL}/friends`,
          element: <>All you'r friends</>,
          showOnSideNav: false,
          showOnTab: true,
          key: "all-friends",
          label: "Friends",
        },
        {
          path: `${BASE_URL}/blocked`,
          element: <>Blocked User</>,
          showOnSideNav: false,
          showOnTab: true,
          key: "blocked-user",
          label: "Blocked User",
        },
      ],
    },
  ];

  return routes;
};

export default getCommunityRoutes;
