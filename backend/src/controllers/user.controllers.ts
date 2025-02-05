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
    return res.send({ status: true, user: req.user });
  };

  public logoutAuthUser = async (req: Request, res: Response): Promise<any> => {
    res.clearCookie("jwt-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).send({ status: true });
  };
}

export default UserController;
