import R from "ramda";
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
    // allRoles.shift();

    return allRoles;
  };

  /**
   * Get all the validated roles for user
   */
  public getAllValidatedRoles = (roles: string[]) => {
    const allValidatedNewRoles = roles.reduce((acc, role) => {
      // Get all the parent roles of this current role
      const allParentRolesApplied = this.getAllRoles(role, false);
      return [...acc, ...allParentRolesApplied];
    }, []);

    // Return the unique roles
    return R.uniq(allValidatedNewRoles);
  };

  /**
   * Get all the validated privileges for user
   */
  public getAllValidatedPriviledges = (user: IUser, privileges: string[]) => {
    // Get all the roles applied to user
    const userAssignedRoles = user.roles;

    // Get all the privileges of the roles applied to user
    const userEligiblePrivileges = userAssignedRoles.reduce((acc, role) => {
      const currentRolePrev =
        RolesDetails.find((r) => r.role === role)?.privileges || [];
      return [...acc, ...currentRolePrev];
    }, []);

    // Filter the privileges which are eligible for user
    const finalPrivileges = userEligiblePrivileges.filter((priv) =>
      privileges.includes(priv)
    );

    console.log("LOGS>>> ", userEligiblePrivileges, finalPrivileges);

    // Return the unique privileges
    return R.uniq(finalPrivileges);
  };

  public assignNewRoleAndPrivileges = async (payload: {
    type: "role" | "privilege";
    roles: string[];
    privileges: string[];
    user: IUser;
  }) => {
    const { type, user, roles, privileges } = payload;

    switch (type) {
      case "role":
        const validatedRoles = this.getAllValidatedRoles(roles);
        await this.userDao.setRolesAndPrivilegesOfUser({
          user_id: user._id,
          roles: validatedRoles,
        });
        break;
      case "privilege":
        const validatedPrivileges = this.getAllValidatedPriviledges(
          user,
          privileges
        );
        await this.userDao.setRolesAndPrivilegesOfUser({
          user_id: user._id,
          privileges: validatedPrivileges,
        });
        break;
      default:
        throw new Error("Invalid Type for Assign Role and Privileges");
    }
  };
}
