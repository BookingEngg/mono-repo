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
  [privilegesEnum.DEFAULT_USER]: {
    description: "Default Privilege of User",
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
  [privilegesEnum.APPLY_JOBS]: {
    description: "Apply For Jobs",
    default: false,
  },
  [privilegesEnum.CREATE_JOBS]: {
    description: "Create Jobs",
    default: false,
  },
  [privilegesEnum.UPDATE_JOBS]: {
    description: "Update Jobs Details",
    default: false,
  },
};

// Default roles and privileges while signup
export const defaultUserRolesWhileSignup = [
  rolesEnum.USER,
  rolesEnum.INFLUENCER,
];
export const defaultUserPrivilegeWhileSignup = [
  privilegesEnum.DEFAULT_USER,
  privilegesEnum.PROFILE,
  privilegesEnum.PROFILE_UPDATE,

  privilegesEnum.EXPLORE_JOBS,
];
export const defaultBrandRolesWhileSignup = [rolesEnum.USER, rolesEnum.BRAND];
export const defaultBrandPrivilegeWhileSignup = [
  privilegesEnum.DEFAULT_USER,
  privilegesEnum.PROFILE,
  privilegesEnum.PROFILE_UPDATE,

  privilegesEnum.CREATE_JOBS,
  privilegesEnum.UPDATE_JOBS,
];

const RolesDetails: IRole[] = [
  {
    role: rolesEnum.USER,
    parents: [],
    children: [rolesEnum.INFLUENCER, rolesEnum.BRAND, rolesEnum.ADMIN],
    privileges: [
      privilegesEnum.DEFAULT_USER,
      privilegesEnum.PROFILE,
      privilegesEnum.PROFILE_UPDATE,
    ],
  },
  {
    role: rolesEnum.INFLUENCER,
    parents: [rolesEnum.USER],
    children: [],
    privileges: [privilegesEnum.EXPLORE_JOBS, privilegesEnum.APPLY_JOBS],
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
  let defaultRoles = defaultUserRolesWhileSignup;
  let defaultPrivledges = defaultUserPrivilegeWhileSignup;

  if (userType === UserTypeEnum.BRAND) {
    defaultRoles = defaultBrandRolesWhileSignup;
    defaultPrivledges = defaultBrandPrivilegeWhileSignup;
  }

  return {
    roles: defaultRoles,
    privileges: defaultPrivledges,
  };
};

export { RolesDetails, PrivilegeDetails };
