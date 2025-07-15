import { RolesDetails, PrivilegeDetails } from "@/constants/roles.constants";
import { IUser } from "@/interfaces/user.interface";
import UserDao from "@/dao/user.dao";

// This file is handling the RBAC (Role Based Access Control)
export default class RBAC {
  private userDao = new UserDao();

  /**
   * Get all the privileges of a role (including inherited ones)
   */
  private getAllPrivilegesOfRole = (
    roleName: string,
    restrictedOnly: boolean
  ): string[] => {
    const roleDetails = RolesDetails.find((role) => role.role === roleName);
    if (!roleDetails) return [];

    const inheritedPrivileges = roleDetails.parents.flatMap((parent) =>
      this.getAllPrivilegesOfRole(parent, restrictedOnly)
    );

    let currentPrivileges = roleDetails.privileges || [];
    if (restrictedOnly) {
      currentPrivileges = currentPrivileges.filter(
        (priv) => !PrivilegeDetails?.[priv]?.default
      );
    }

    return [...currentPrivileges, ...inheritedPrivileges];
  };

  public getAllPrivileges = (
    roles: string[],
    restrictedOnly = false
  ): string[] => {
    if (!roles?.length) return [];

    const allPrivileges = roles.flatMap((role) =>
      this.getAllPrivilegesOfRole(role, restrictedOnly)
    );

    return [...new Set(allPrivileges)];
  };

  public getAllRoles = (
    roleName: string,
    traverseChildren = false
  ): string[] => {
    const visited = new Set<string>();

    const dfs = (roleName: string): string[] => {
      if (visited.has(roleName)) return [];
      visited.add(roleName);

      const roleDetails = RolesDetails.find((role) => role.role === roleName);
      if (!roleDetails) return [];

      const relatedRoles = traverseChildren
        ? roleDetails.children
        : roleDetails.parents;

      return [roleName, ...relatedRoles.flatMap(dfs)];
    };

    const allRoles = dfs(roleName);

    // Remove the root role itself from the result (optional)
    allRoles.shift();

    return allRoles;
  };

  public setUserRolesAndPrivilege = async ({
    role,
    privileges,
    user,
  }: {
    role: string;
    privileges: string[];
    user: IUser;
    action: "add" | "remove";
  }) => {
    await this.setRolesPrivilegesOfUser({
      user,
      newRole: role,
      newPrivileges: privileges,
    });
  };

  public unsetRolesPrivilegesOfUser = async ({
    user,
    newRole,
    newPrivileges,
  }: {
    user: IUser;
    newRole: string;
    newPrivileges: string[];
  }) => {
    const roleDetails = RolesDetails.find((r) => r.role === newRole);
    if (!roleDetails) throw new Error("Invalid Role");
    // TODO: for unset the roles
  };

  public setRolesPrivilegesOfUser = async ({
    user,
    newRole,
    newPrivileges,
  }: {
    user: IUser;
    newRole: string;
    newPrivileges: string[];
  }) => {
    const roleDetails = RolesDetails.find((r) => r.role === newRole);
    if (!roleDetails) throw new Error("Invalid Role");

    for (const privilege of newPrivileges) {
      if (!roleDetails.privileges.includes(privilege)) {
        throw new Error(
          `Invalid privilege "${privilege}" for role "${newRole}"`
        );
      }
    }

    const descendantPrivileges = this.getAllPrivileges([newRole], true);
    const allRoles = this.getAllRoles(newRole, true);

    let finalPrivileges = descendantPrivileges.filter(
      (priv) => !roleDetails.privileges.includes(priv)
    );

    if (newPrivileges.length) {
      finalPrivileges.push(...newPrivileges);
    }

    const updatePayload = {
      $addToSet: {
        roles: { $each: allRoles },
        privileges: { $each: [...new Set(finalPrivileges)] },
      },
    };

    await this.userDao.updateUserDetailsById(user._id, updatePayload);
  };
}
