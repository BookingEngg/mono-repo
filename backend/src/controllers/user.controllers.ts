import { Request, Response } from "express";
import UserService from "@/services/user.service";

class UserController {
  private userService = new UserService();

  public createUser = async (_req: Request, res: Response): Promise<any> => {
    const response = await this.userService.createUser();
    return res.send({ response });
  };

  public getUsers = async (req: Request, res: Response): Promise<any> => {
    if (!req.user) {
      return res.status(401);
    }
    return res.send({ status: "success", user: req.user });
  };
}

export default UserController;
