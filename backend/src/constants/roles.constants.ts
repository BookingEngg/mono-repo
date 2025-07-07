export interface IPrivledges {
  description: string;
  default: boolean;
}

export interface IRole {
  role: string;
  extends: string[];
  privledges: string[];
}

const PRIVILEGE: Record<string, IPrivledges> = {
  "privledge/community/viewer": {
    description: "Can View Community",
    default: true,
  },
  "privledge/community/manipulate": {
    description: "Can Manipulate Community",
    default: true,
  },
  "privledge/communication/viewer": {
    description: "Can View Communication Tab",
    default: true,
  },
  "privledge/communication/writer": {
    description: "Can Manipulate Communication Tab",
    default: true,
  },
  "privledge/assign/roles-privledge": {
    description: "Can Assign Roles Privledges",
    default: false,
  },
  "privledge/remove/roles-privledge": {
    description: "Can Remove Roles Privledges",
    default: false,
  },
  "privledge/create-roles": {
    description: "Can Create Roles",
    default: false,
  },
};

const ROLES: IRole[] = [
  {
    role: "roles/users",
    extends: [],
    privledges: [
      "privledge/community/viewer",
      "privledge/community/manipulate",
      "privledge/communication/viewer",
      "privledge/communication/writer",
    ],
  },
  {
    role: "roles/admin",
    extends: ["roles/users"],
    privledges: [
      "privledge/communication/group/create",
      "privledge/communication/group/manipulate",
      "privledge/system-block",
    ],
  },
  {
    role: "roles/super-admin",
    extends: ["roles/admin"],
    privledges: [
      "privledge/assign/roles-privledge",
      "privledge/remove/roles-privledge",
      "privledge/create-roles",
    ],
  },
];

export { ROLES, PRIVILEGE };
