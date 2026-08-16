import { privilegesEnum, rolesEnum, UserTypeEnum } from "@/interfaces/enum";

export interface Iprivileges {
  description: string;
  default: boolean;
}

export interface IRole {
  role: string;
  parents: string[]; // Refer to the immediate parent roles
  children: string[]; // Refer to the immediate child roles
  privileges: string[];
}

const PrivilegeDetails: Record<string, Iprivileges> = {
  [privilegesEnum.DEFAULT]: {
    description: "Default Privilege",
    default: true,
  },
  [privilegesEnum.PROFILE]: {
    description: "Profile Privilege",
    default: false,
  },
  [privilegesEnum.PROFILE_UPDATE]: {
    description: "Profile Update Privilege",
    default: false,
  },
  [privilegesEnum.EXPLORE_JOBS]: {
    description: "Explore Jobs",
    default: false,
  },
};

// Default roles and privileges while signup
export const defaultUserAssignedRolesWhileSignup = [rolesEnum.USER];
export const defaultUserAssignedPrivilegeWhileSignup = [
  privilegesEnum.DEFAULT,
  privilegesEnum.PROFILE,
  privilegesEnum.PROFILE_UPDATE,
  privilegesEnum.EXPLORE_JOBS,
];

const RolesDetails: IRole[] = [
  {
    role: rolesEnum.USER,
    parents: [],
    children: [rolesEnum.ADMIN],
    privileges: [
      privilegesEnum.DEFAULT,
      privilegesEnum.PROFILE,
      privilegesEnum.PROFILE_UPDATE,

      privilegesEnum.EXPLORE_JOBS,
    ],
  },
  {
    role: rolesEnum.BRAND,
    parents: [rolesEnum.USER],
    children: [],
    privileges: [privilegesEnum.CREATE_JOBS, privilegesEnum.UPDATE_JOBS],
  },
  {
    role: rolesEnum.ADMIN,
    parents: [rolesEnum.USER],
    children: [],
    privileges: [],
  },
];

/**
 * Roles/privileges assigned on ACCOUNT CREATION only, based on the account
 * type a creator picked at signup. Anything other than the literal "brand"
 * is treated as a regular user, so a bad/unexpected value can never escalate
 * beyond the brand privilege set.
 */
export const getSignupRolesAndPrivileges = (
  userType: UserTypeEnum,
): { roles: rolesEnum[]; privileges: privilegesEnum[] } => {
  let defaultRoles = defaultUserAssignedRolesWhileSignup;
  let defaultPrivledges = defaultUserAssignedPrivilegeWhileSignup;

  if (userType === UserTypeEnum.BRAND) {
    defaultRoles = [rolesEnum.USER, rolesEnum.BRAND];
    defaultPrivledges = [
      ...defaultUserAssignedPrivilegeWhileSignup,
      privilegesEnum.CREATE_JOBS,
      privilegesEnum.UPDATE_JOBS,
    ];
  }

  return {
    roles: defaultRoles,
    privileges: defaultPrivledges,
  };
};

export { RolesDetails, PrivilegeDetails };
