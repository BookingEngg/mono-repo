import { Request, Response } from "express";
import OAuthService from "@/services/oAuth.service";
import JwtService from "@/services/jwt.service";
import { UserTypeEnum } from "@/interfaces/enum";

// Anything other than the literal "brand" is treated as a regular user, so a
// tampered query/body value can never request an elevated account type.
const toUserType = (value: string): UserTypeEnum | undefined => {
  return value === UserTypeEnum.BRAND ? UserTypeEnum.BRAND : UserTypeEnum.USER;
};

class OAuthController {
  private oAuthService = new OAuthService();
  private jwtService = new JwtService();

  public getClientDetails = async (_req: Request, res: Response) => {
    const response = this.oAuthService.getClientIds();
    return res.send(response);
  };

  public initGithubOAuth = async (req: Request, res: Response) => {
    const userType = toUserType(req.query.user_type as string);
    const githubUrl = this.oAuthService.navigateToGithubLogin(userType);
    return res.redirect(githubUrl);
  };

  public getGithubOAuthUser = async (req: Request, res: Response) => {
    const { code, state } = req.query;
    // `state` round-trips as "<configured-secret>:<user_type>" when a
    // user_type was chosen at the initGithubOAuth step; see navigateToGithubLogin.
    const [, encodedUserType] = (state as string || "").split(":");
    const userType = toUserType(encodedUserType);

    const response = await this.oAuthService.getGithubVerifiedUser(
      code as string,
      userType,
    );

    this.jwtService.setCookieAtClientSide({
      res,
      cookieDetails: response,
    });

    return res.redirect(response.redirection_url);
  };

  public getGoogleOAuthUser = async (req: Request, res: Response) => {
    const { token, user_type } = req.body;
    const response = await this.oAuthService.getGoogleVerifiedUser(
      token,
      toUserType(user_type),
    );

    this.jwtService.setCookieAtClientSide({
      res,
      cookieDetails: response,
    });

    return res.json({ is_verified_user: response.verifiedUser });
  };
}

export default OAuthController;
