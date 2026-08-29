import { Request, Response } from "express";
import OAuthService from "@/services/oAuth.service";
import JwtService from "@/services/jwt.service";
import { UserTypeEnum } from "@/interfaces/enum";

// Anything other than the literal "brand" is treated as a regular user, so a
// tampered query/body value can never request an elevated account type.
const toUserType = (value: string): UserTypeEnum | undefined => {
  return value === UserTypeEnum.BRAND ? UserTypeEnum.BRAND : UserTypeEnum.INFLUENCER;
};

// Only the literal boolean-ish "true" opts into signup — anything else
// (missing, "false", garbage) is treated as a login attempt, which never
// creates a new account.
const toIsSignup = (value: unknown): boolean => value === true || value === "true";

class OAuthController {
  private oAuthService = new OAuthService();
  private jwtService = new JwtService();

  public getClientDetails = async (_req: Request, res: Response) => {
    const response = this.oAuthService.getClientIds();
    return res.send(response);
  };

  public initGithubOAuth = async (req: Request, res: Response) => {
    const userType = toUserType(req.query.user_type as string);
    const isSignup = toIsSignup(req.query.is_signup);
    const githubUrl = this.oAuthService.navigateToGithubLogin(
      userType,
      isSignup,
    );
    return res.redirect(githubUrl);
  };

  public getGithubOAuthUser = async (req: Request, res: Response) => {
    const { code, state } = req.query;
    // user_type/is_signup never survive GitHub's own redirect — they're
    // packed into `state` on the way out and unpacked here on the way back.
    const { userType, isSignup } = this.oAuthService.decodeGithubState(
      state as string,
    );

    const response = await this.oAuthService.getGithubVerifiedUser(
      code as string,
      userType,
      isSignup,
    );

    this.jwtService.setCookieAtClientSide({
      res,
      cookieDetails: response,
    });

    return res.redirect(response.redirection_url);
  };

  public getGoogleOAuthUser = async (req: Request, res: Response) => {
    const { token, user_type, is_signup } = req.body;
    const response = await this.oAuthService.getGoogleVerifiedUser(
      token,
      toUserType(user_type),
      toIsSignup(is_signup),
    );

    this.jwtService.setCookieAtClientSide({
      res,
      cookieDetails: response,
    });

    return res.json({ is_verified_user: response.verifiedUser });
  };
}

export default OAuthController;
