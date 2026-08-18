import { auth, OAuth2Client } from "google-auth-library";
import { googleOAuthConfigs, githubOAuthConfigs } from "@/config";
import JwtService from "@/services/jwt.service";
import UserService from "@/services/user.service";
import { getExternalDomain, getRedirectionUrlToUi } from "@/util/utils.util";
import OAuthHttp from "@/https/oAuth.http";
import OAuthFormatter from "@/formatter/oAuth.formatter";
import { OAuthClients, UserTypeEnum } from "@/interfaces/enum";

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

  /**
   * GitHub's signin is a full page redirect, so `user_type` can't be sent as
   * a request body like Google's — it's round-tripped through the `state`
   * param instead, which GitHub echoes back verbatim to the callback.
   */
  public navigateToGithubLogin = (userType?: UserTypeEnum) => {
    const {
      client_id: clientId,
      redirect_url_endpoint: redirectUrlEndpoint,
      scope,
      state,
    } = githubOAuthConfigs;

    const redirectURI = getExternalDomain() + redirectUrlEndpoint;
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectURI}&scope=${scope}&state=${state}&user_type=${userType}`;
  };

  public getGithubVerifiedUser = async (
    code: string,
    userType?: UserTypeEnum,
  ) => {
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
      tokenResponse.access_token,
    );

    if (!authorizedUser["email"]) {
      const emails = await this.oAuthHttp.getUserEmails(
        tokenResponse.access_token,
      );
      const verifiedEmail = emails.find((email) => email.verified);
      authorizedUser["email"] = verifiedEmail?.email;
    }

    return await this.postVerifiedOAuthUser(
      authorizedUser,
      OAuthClients.GITHUB,
      userType,
    );
  };

  public getGoogleVerifiedUser = async (
    token: string,
    userType: UserTypeEnum,
  ) => {
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
        OAuthClients.GOOGLE,
        userType,
      );
    } catch (_err) {
      throw _err;
    }
  };

  private postVerifiedOAuthUser = async (
    verifiedUser: object,
    source: OAuthClients,
    userType: UserTypeEnum,
  ) => {
    if (!verifiedUser) {
      return null;
    }
    const authorizedEmail = verifiedUser["email"];
    let jwtToken = null;

    jwtToken = this.jwtService.createToken({ email: authorizedEmail });
    const existingValidUser =
      await this.userService.getInhouseUserDetailsByEmail(authorizedEmail);

    const isBrandProfile = (existingValidUser?.roles || []).includes(
      UserTypeEnum.BRAND,
    );
    const isDuplicateProfileRequest = isBrandProfile
      ? userType !== UserTypeEnum.BRAND
      : userType !== UserTypeEnum.INFLUENCER;

    // Only a brand-new account respects the chosen user_type — an existing
    // creator's roles are never modified just because they logged in again.
    if (!existingValidUser) {
      const formattedInhouseUserMapper = {
        [OAuthClients.GOOGLE]:
          this.oAuthFormatter.getFormattedGoogleUserDetails(verifiedUser),
        [OAuthClients.GITHUB]:
          this.oAuthFormatter.getFormattedGithubUserDetails(verifiedUser),
      };

      await this.userService.createUser(
        formattedInhouseUserMapper[source],
        userType,
      );
    } else if (isDuplicateProfileRequest) {
      // User with different role already exists
      throw new Error(
        "User with this email already exists with a different role",
      );
    }

    return {
      verifiedUser: !!verifiedUser,
      jwtToken,
      redirection_url: getRedirectionUrlToUi(),
    };
  };
}

export default OAuthService;
