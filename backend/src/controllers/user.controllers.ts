import { Request, Response } from "express";
import UserService from "@/services/user.service";
import JwtService from "@/services/jwt.service";

class UserController {
  private userService = new UserService();
  private jwtService = new JwtService();

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
    res: Response,
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

  /**
   * Brand's small signup form (no OAuth, no password). Mints the same
   * jwt-token cookie OAuth/OTP login do, so the brand lands already signed
   * in on the onboarding step rather than needing a separate login.
   */
  public brandSignup = async (req: Request, res: Response): Promise<any> => {
    const existingUser = await this.userService.getInhouseUserDetailsByEmail(
      req.body.email,
    );
    if (existingUser) {
      return res
        .status(409)
        .send({
          status: false,
          message: "An account with this email already exists",
        });
    }

    const user = await this.userService.createBrandSignupUser(req.body);

    const token = this.jwtService.createToken({ email: user.email });
    this.jwtService.setCookieAtClientSide({
      res,
      cookieDetails: { verifiedUser: true, jwtToken: token },
    });

    return res.send({ status: true });
  };
}

export default UserController;
