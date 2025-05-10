import { OAuth2Client } from "google-auth-library";
import { googleOAuthConfigs, githubOAuthConfigs } from "@/config";
import JwtService from "@/services/jwt.service";
import UserService from "@/services/user.service";
import { getExternalDomain, getRedirectionUrlToUi } from "@/util/utils.util";
import OAuthHttp from "@/https/oAuth.http";
import OAuthFormatter from "@/formatter/oAuth.formatter";
import { OAuthClients } from "@/interfaces/enum";

class OAuthService {
  // Services
  private jwtService = new JwtService();
  private userService = new UserService();
  // Http
  private oAuthHttp = new OAuthHttp();
  // Formatter
  private oAuthFormatter = new OAuthFormatter();


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

  public getGithubVerifiedUser = async (code: string) => {
    const { client_id: clientId, client_secret: clientSecret } =
      githubOAuthConfigs;

    const tokenResponse = await this.oAuthHttp.getAccessToken({
      clientId,
      clientSecret,
      requestToken: code,
    });

    if (!tokenResponse?.access_token) {
      throw new Error("Invalid Token");
    }

    const authorizedUser = await this.oAuthHttp.getAuthorizedUser(
      tokenResponse.access_token
    );// TODO: need to check why email is null came from github

    return await this.postVerifiedOAuthUser(
      authorizedUser,
      OAuthClients.GITHUB
    );
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
      return await this.postVerifiedOAuthUser(
        verifiedUser,
        OAuthClients.GOOGLE
      );
    } catch (_err) {
      return null;
    }
  };

  private postVerifiedOAuthUser = async (
    verifiedUser: object,
    source: OAuthClients
  ) => {
    if (!verifiedUser) {
      return null;
    }
    let jwtToken = null;

    jwtToken = this.jwtService.createToken({ email: verifiedUser["email"] });
    const existingValidUser =
      await this.userService.getInhouseUserDetailsByEmail(
        verifiedUser["email"]
      );

    if (!existingValidUser) {
      const formattedInhouseUserMapper = {
        [OAuthClients.GOOGLE]:
          this.oAuthFormatter.getFormattedGithubUserDetails(verifiedUser),
        [OAuthClients.GITHUB]:
          this.oAuthFormatter.getFormattedGithubUserDetails(verifiedUser),
      };

      await this.userService.createUser(formattedInhouseUserMapper[source]);
    }

    return {
      verifiedUser: !!verifiedUser,
      jwtToken,
      redirection_url: getRedirectionUrlToUi(),
    };
  };
}

export default OAuthService;
