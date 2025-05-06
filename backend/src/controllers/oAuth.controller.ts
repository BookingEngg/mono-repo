import { Request, Response } from "express";
import OAuthService from "@/services/oAuth.service";
import { tokenDetails } from "@/config/index";

class OAuthController {
  private oAuthService = new OAuthService();

  public getClientDetails = async (_req: Request, res: Response) => {
    const response = this.oAuthService.getGoogleOAuthClientId();
    return res.send(response);
  };

  public getGoogleOAuthUser = async (req: Request, res: Response) => {
    const { token } = req.body;
    const response = await this.oAuthService.getGoogleVerifiedUser(token);

    if (!response || !response?.jwtToken || !response?.verifiedUser) {
      throw new Error("Invalid Google Login");
    }
    const { verifiedUser, jwtToken } = response;

    res.cookie("jwt-token", jwtToken, {
      maxAge: 1000 * 60 * 60 * 24 * (tokenDetails.token_ttl_max_days || 10), // Default 10 Days JWT Expire
      secure: true,
      sameSite: "none",
    });
    return res.json({ is_verified_user: verifiedUser });
  };
}

export default OAuthController;
