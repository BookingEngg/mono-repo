import { ROLES } from "@/constants/roles.constants";
import UserDao from "@/dao/user.dao";

// This file is all handling the RBAC (Role Based Access Control)
export default class RBAC {
  private static userDao = new UserDao();

  /**
   * Get all the privledges of a role (including inherited ones)
   * @param {string} roleName 
   */
  private static getAllPrivledgesOfRole = (roleName: string) => {
    const roleDetails = ROLES.find((role) => role.role === roleName);

    if (!roleDetails) {
      return [];
    }

    const allParentPrivledges = roleDetails.extends.reduce((acc, parent) => {
      const parentPrivledges = this.getAllPrivledgesOfRole(parent);
      return [...acc, ...parentPrivledges];
    }, []);

    return [...roleDetails.privledges, ...allParentPrivledges];
  };

  public static getAllPrivledges = async (userId: string) => {
    const user = await this.userDao.getUserByUserId(userId, ['roles']);

    if(!user?.roles?.length) {
      return [];
    }

    const allPrivledgesOfUser = [];
    user.roles.forEach((role) => {
      allPrivledgesOfUser.push(...this.getAllPrivledgesOfRole(role));
    })

    const distinctPrivledges = [...new Set(allPrivledgesOfUser)];
    return distinctPrivledges;

  };
}
