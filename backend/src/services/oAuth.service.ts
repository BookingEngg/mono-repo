import { OAuth2Client } from "google-auth-library";
import { googleOAuthConfigs, githubOAuthConfigs } from "@/config";
import JwtService from "@/services/jwt.service";
import UserService from "@/services/user.service";
import { getExternalDomain } from "@/util/utils.util";

class OAuthService {
  private jwtService = new JwtService();
  private userService = new UserService();

  public getClientIds = () => {
    const externServerUrl = getExternalDomain();

    const clientsIds = {
      google_client_id: googleOAuthConfigs.client_id,
      github_init_url: `${externServerUrl}/oauth/github_init`,
    };

    return clientsIds;
  };

  public navigateToGithubLogin = () => {
    const {
      client_id: clientId,
      redirect_url_endpoint: redirectUrlEndpoint,
      scope,
      state,
    } = githubOAuthConfigs;

    const redirectURI = getExternalDomain() + redirectUrlEndpoint;
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectURI}&scope=${scope}&state=${state}`;
  };

  public getGithubVerifiedUser = async () => {
    // const {
    //   client_id: clientId,
    //   client_secret: clientSecret,
    //   access_token_url: accessTokenUrl,
    // } = githubOAuthConfigs;

    // const tokenRes = await axios.post(accessTokenUrl, {
    //   client_id: clientId,
    //   client_secret: clientSecret,
    //   code,
    // }, {
    //   headers: { Accept: 'application/json' }
    // });
    // const access_token = tokenRes.data.access_token;
    // // 4. Get user info
    // const userRes = await axios.get('https://api.github.com/user', {
    //   headers: { Authorization: `Bearer ${access_token}` }
    // });
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

export default OAuthService;
