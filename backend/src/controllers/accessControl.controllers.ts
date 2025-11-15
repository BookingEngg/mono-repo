import { Request, Response } from "express";
import RBAC from "@/services/rolesPrivilege.service";

class AccessControlController {
  private rbac = new RBAC();

  public assignNewRolesAndPrivileges = async (
    req: Request<
      {},
      {},
      { roles: string[]; privileges: string[]; type: "role" | "privilege" }
    >,
    res: Response
  ): Promise<any> => {
    const user = req.user;
    if (!user) {
      throw new Error("User Not Found");
    }
    const { type, roles = [], privileges = [] } = req.body;

    await this.rbac.assignNewRoleAndPrivileges({ type, roles, privileges, user})
    
    return res.send({ status: "success" });
  };

  public removeRolesAndPrivileges = async (
    req: Request<
      {},
      {},
      { roles: string[]; privileges: string[]; type: "role" | "privilege" }
    >,
    res: Response
  ): Promise<any> => {
    const user = req.user;
    if (!user) {
      throw new Error("User Not Found");
    }
    const { type, roles = [], privileges = [] } = req.body;

    await this.rbac.removeRolesAndPrivileges({ type, roles, privileges, user})
    
    return res.send({ status: "success" });
  };
}

export default AccessControlController;
