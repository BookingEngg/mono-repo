import { Request, Response } from "express";
import OAuthService from "@/services/oAuth.service";
import JwtService from "@/services/jwt.service";

class OAuthController {
  private oAuthService = new OAuthService();
  private jwtService = new JwtService();

  public getClientDetails = async (_req: Request, res: Response) => {
    const response = this.oAuthService.getClientIds();
    return res.send(response);
  };

  public initGithubOAuth = async (_req: Request, res: Response) => {
    const githubUrl = this.oAuthService.navigateToGithubLogin();
    return res.redirect(githubUrl);
  };

  public getGithubOAuthUser = async (req: Request, res: Response) => {
    const { code } = req.query;
    const response = await this.oAuthService.getGithubVerifiedUser(
      code as string
    );

    this.jwtService.setCookieAtClientSide({
      res,
      cookieDetails: response,
    });

    return res.redirect(response.redirection_url);
  };

  public getGoogleOAuthUser = async (req: Request, res: Response) => {
    const { token } = req.body;
    const response = await this.oAuthService.getGoogleVerifiedUser(token);

    this.jwtService.setCookieAtClientSide({
      res,
      cookieDetails: response,
    });

    return res.json({ is_verified_user: response.verifiedUser });
  };
}

export default OAuthController;
