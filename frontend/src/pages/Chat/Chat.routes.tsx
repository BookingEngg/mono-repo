// Organism
import Communication from "@/organism/Communication";
import {
  CommunicationV2,
  GroupCommunication,
} from "@/organism/CommunicationV2";
// Icons
import { MessageCircle, MessageCircleMore, MessagesSquare } from "lucide-react";
// Constants
import { ROLES } from "@/constants/common.constant";
// Typings
import { TRoutes } from "@/typings/common";

const BASE_OLD_URL = "/chat";
const BASE_URL = "/chat-v2";

const getChatRoutes = () => {
  const routes: TRoutes[] = [
    {
      path: BASE_OLD_URL,
      element: <Communication />,
      icon: <MessageCircle />,
      showOnSideNav: false, // Make the user not directly accessible_roles
      key: "communication",
      label: "Communication",
      handle: {
        identifier: "root",
      },
      accessible_roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    },
    {
      path: BASE_URL,
      element: <CommunicationV2 />,
      icon: <MessageCircleMore />,
      showOnSideNav: true,
      key: "communication-v2",
      label: "Communication",
      handle: {
        identifier: "root",
      },
      accessible_roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    },
    {
      path: `${BASE_URL}/groups`,
      element: <GroupCommunication />,
      icon: <MessagesSquare />,
      showOnSideNav: true,
      key: "communication-group-v2",
      label: "Groups",
      handle: {
        identifier: "root",
      },
      accessible_roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    },
  ];

  return routes;
};

export default getChatRoutes;
