import { Request, Response } from "express";
import UserService from "@/services/user.service";

class UserController {
  private userService = new UserService();

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

  public getDashboardSummary = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const user = req.user;
    if (!user?._id) {
      return res.status(401);
    }

    const response = await this.userService.getSummaryDetails(user._id);

    return res.send({ data: response });
  };

  /**
   * Influencer onboarding — sets age/gender/social media links on the
   * authenticated user's own account.
   */
  public updateOnboardingDetails = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user?._id) {
      return res.status(401);
    }

    const user = await this.userService.updateOnboardingDetails(
      req.user._id,
      req.body,
    );

    return res.send({ status: "success", data: user });
  };
}

export default UserController;
