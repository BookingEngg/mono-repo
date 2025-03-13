import { OAuth2Client } from "google-auth-library";
import { googleOAuthConfigs } from "@/config";
import JwtService from "@/services/jwt.service";
import UserService from "@/services/user.service";

class GoogleOAuthService {
  private jwtService = new JwtService();
  private userService = new UserService();

  public getGoogleOAuthClientId = () => {
    return { client_id: googleOAuthConfigs.client_id };
  };

  public getGoogleVerifiedUser = async (token: string) => {
    const { client_id: clientId } = googleOAuthConfigs;
    const googleAuthClient = new OAuth2Client(clientId);
    try {
      const googleVerifiedUser = await googleAuthClient.verifyIdToken({
        idToken: token,
        audience: clientId,
      });

      const verifiedUser = googleVerifiedUser.getPayload();
      let jwtToken = null;

      if (verifiedUser) {
        jwtToken = this.jwtService.createToken({ email: verifiedUser.email });
        const existingValidUser =
          await this.userService.getInhouseUserDetailsByEmail(
            verifiedUser.email
          );

        if (!existingValidUser) {
          await this.userService.createUser(verifiedUser);
        }
      }

      return {
        verifiedUser: !!verifiedUser,
        jwtToken,
      };
    } catch (_err) {
      return null;
    }
  };
}

export default GoogleOAuthService;
