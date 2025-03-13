import { Request, Response } from "express";

class UserController {
  public getUsers = async (req: Request, res: Response): Promise<any> => {
    if (!req.user?._id) {
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
