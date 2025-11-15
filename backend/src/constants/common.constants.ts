export const Roles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
};

export type RoleType = (typeof Roles)[keyof typeof Roles];

export const RolesAccessibilityWithRoles: Record<RoleType, RoleType[]> = {};

export enum Privileges {
  CommunityAccess = "community-privilege",
  CommunicationAccess = "communication",

  GroupCreation = "create-groups",
  GroupManagement = "delete-update-groups",
  UserSystemBlocking = "system-block-users",
}

export enum RequestStatusType {
  SEND_REQUEST = "send",
  RECEIVE_REQUEST = "receive",
}

export enum BlockedStatus {
  SELF_BLOCKED = "self-blocked", // Status if you blocked some user
  BLOCKED_BY_PEER = "peer-blocked", // Status if you were blocked by some user
}

export enum BlockedType {
  DECLINE_FRIEND_REQ = "decline-friend-request",
  BLOCKED = "blocked",
}
