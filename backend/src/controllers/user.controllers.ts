import { Request, Response } from "express";
import UserService from "@/services/user.service";

class UserController {
  private userService = new UserService();

  public createUser = async (_req: Request, res: Response): Promise<any> => {
    const response = await this.userService.createUser();
    return res.send({ response });
  };

  public getUsers = async (_req: Request, res: Response): Promise<any> => {
    return res.send({ status: "success" });
  };
}

export default UserController;
