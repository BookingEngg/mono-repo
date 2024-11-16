import { Request, Response } from "express";
import UserService from "@/services/user.service";

class UserController {
  private userService = new UserService();

  public createUser = async (_req: Request, res: Response): Promise<any> => {
    // TODO : need to remove any
    const response = await this.userService.createUser();
    return res.send(response);
  };

  public getUsers = async (_req: Request, res: Response): Promise<any> => {
    // TODO: need to remove any
    const response = await this.userService.getUsers();
    return res.send(response);
  };
}

export default UserController;
