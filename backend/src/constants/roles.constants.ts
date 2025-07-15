export interface Iprivileges {
  description: string;
  default: boolean;
}

export interface IRole {
  role: string;
  parents: string[];  // Refer to the immediate parent roles
  children: string[], // Refer to the immediate child roles
  privileges: string[];
}

const PrivilegeDetails: Record<string, Iprivileges> = {
  "privilege/community/viewer": {
    description: "Can View Community",
    default: true,
  },
  "privilege/community/manipulate": {
    description: "Can Manipulate Community",
    default: true,
  },
  "privilege/communication/viewer": {
    description: "Can View Communication Tab",
    default: true,
  },
  "privilege/communication/writer": {
    description: "Can Manipulate Communication Tab",
    default: false,
  },
  "privilege/communication/group/create": {
    description: "Can Create Group in Communication Tab",
    default: false,
  },
  "privilege/communication/group/manipulate": {
    description: "Can Manipulate Group in Communication Tab",
    default: false,
  },
  "privilege/system-block": {
    description: "Can Block Some other user",
    default: false,
  },
  "privilege/remove/roles-privilege": {
    description: "Can Remove Roles privileges",
    default: false,
  },
  "privilege/assign/roles-privilege": {
    description: "Can Assign Roles privileges",
    default: false,
  },
};

const RolesDetails: IRole[] = [
  {
    role: "roles/users",
    parents: [],
    children: ["roles/admin"],
    privileges: [
      "privilege/community/viewer",
      "privilege/community/manipulate",
      "privilege/communication/viewer",
      "privilege/communication/writer",
    ],
  },
  {
    role: "roles/admin",
    parents: ["roles/users"],
    children: ["roles/super-admin"],
    privileges: [
      "privilege/communication/group/create",
      "privilege/communication/group/manipulate",
      "privilege/system-block",
    ],
  },
  {
    role: "roles/super-admin",
    parents: ["roles/admin"],
    children: [],
    privileges: [
      "privilege/assign/roles-privilege",
      "privilege/remove/roles-privilege",
    ],
  },
];

export { RolesDetails, PrivilegeDetails };
