// Icons
import { Users } from "lucide-react";
// Pages
import Community from "./Community";
// Organism
import NewFriendsCommunity from "@/organism/Community/NewFriendCommunity";
import FriendsCommunity from "@/organism/Community/FriendsCommunity";
import BlockedUserCommunity from "@/organism/Community/BlockedUserCommunity";
// Typings
import { TRoutes } from "@/typings/common";

export const BASE_URL = "/community";

const getCommunityRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_URL,
      element: <Community />,
      icon: <Users />,
      showOnSideNav: true,
      key: "community",
      label: "Community",
      handle: {
        identifier: "root",
      },
      children: [
        {
          path: `${BASE_URL}/add`,
          element: <NewFriendsCommunity />,
          showOnSideNav: false,
          showOnTab: true,
          key: "add-new-friend",
          label: "Add New Friend",
        },
        {
          path: `${BASE_URL}/friends`,
          element: <FriendsCommunity />,
          showOnSideNav: false,
          showOnTab: true,
          key: "all-friends",
          label: "Friends",
        },
        {
          path: `${BASE_URL}/blocked`,
          element: <BlockedUserCommunity />,
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
