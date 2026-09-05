import { Request, Response } from "express";
import UserService from "@/services/user.service";
import JwtService from "@/services/jwt.service";

class UserController {
  private userService = new UserService();
  private jwtService = new JwtService();

  /**
   * The client's user bootstrap. Social handles live on the user_profile
   * document now, so they're joined in here rather than in AuthMiddleware —
   * the middleware runs on every authenticated request and doesn't need them.
   */
  public getUsers = async (req: Request, res: Response): Promise<any> => {
    if (!req.user?._id) {
      return res.status(401);
    }

    const socialMediaLinks = await this.userService.getSocialMediaLinks(
      req.user._id,
    );

    return res.send({
      status: true,
      user: { ...req.user, social_media_links: socialMediaLinks },
    });
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
   * The profile page's own read — dob/gender plus everything on the profile
   * document, including bank and PAN. Scoped to the caller's own account, and
   * kept off GET /user so payout details aren't loaded on every request.
   */
  public getProfileDetails = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user?._id) {
      return res.status(401);
    }

    const profile = await this.userService.getProfileDetails(req.user._id);

    return res.send({ status: "success", data: profile });
  };

  /**
   * Submits a creator's completed profile for approval.
   *
   * Deliberately a no-op for now — the endpoint exists so the client can be
   * built against it, and the review workflow lands behind it later without
   * the client changing.
   */
  public requestOnboardingApproval = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user?._id) {
      return res.status(401);
    }

    await this.userService.processOnboardingProfile(req.user._id);
    return res.status(200).send({ status: "success" });
  };

  /**
   * Influencer onboarding — sets age/gender/social links, address, bank and
   * KYC details on the authenticated user's own account. Every field is
   * optional, so each profile section saves independently.
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
      return res.status(409).send({
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
