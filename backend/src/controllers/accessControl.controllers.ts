import { Request, Response } from "express";
import RBAC from "@/services/rolesPrivilege.service";

class AccessControlController {
  private rbac = new RBAC();

  public setUserRolesAndPrivilege = async (
    req: Request<
      {},
      {},
      { role: string; priviledges: string[]; action: "add" | "remove" }
    >,
    res: Response
  ): Promise<any> => {
    const user = req.user;
    if (!user) {
      throw new Error("User Not Found");
    }
    const { action, role = '', priviledges = [] } = req.body;

    this.rbac.setUserRolesAndPrivilege({ role, priviledges, user, action });
    return res.send({ status: "success" });
  };
}

export default AccessControlController;
