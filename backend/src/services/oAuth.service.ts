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
   * GitHub's signin is a full page redirect: GitHub's own /authorize
   * endpoint only ever echoes `code` and `state` back to our redirect_uri,
   * nothing else — a `user_type`/`is_signup` query param tacked onto the
   * /authorize URL itself would silently vanish. So both are packed into
   * `state` alongside the CSRF secret, and unpacked again in
   * `decodeGithubState` once GitHub redirects back.
   */
  public navigateToGithubLogin = (
    userType?: UserTypeEnum,
    isSignup?: boolean,
  ) => {
    const {
      client_id: clientId,
      redirect_url_endpoint: redirectUrlEndpoint,
      scope,
    } = githubOAuthConfigs;

    const redirectURI = getExternalDomain() + redirectUrlEndpoint;
    const state = this.encodeGithubState(userType, isSignup);
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectURI}&scope=${scope}&state=${encodeURIComponent(state)}`;
  };

  private encodeGithubState = (userType?: UserTypeEnum, isSignup?: boolean) => {
    const { state } = githubOAuthConfigs;
    return `${state}|${userType ?? ""}|${isSignup ? "1" : "0"}`;
  };

  /**
   * Rejects a state that doesn't start with our configured secret — a
   * minimal CSRF check, same as the plain fixed-string `state` this
   * replaced was meant to provide.
   */
  public decodeGithubState = (
    rawState: string,
  ): { userType: UserTypeEnum; isSignup: boolean } => {
    const { state: secret } = githubOAuthConfigs;
    const [receivedSecret, userTypeRaw, isSignupRaw] = (rawState || "").split(
      "|",
    );

    if (receivedSecret !== secret) {
      throw new Error("Invalid Request!");
    }

    return {
      userType:
        userTypeRaw === UserTypeEnum.BRAND
          ? UserTypeEnum.BRAND
          : UserTypeEnum.INFLUENCER,
      isSignup: isSignupRaw === "1",
    };
  };

  public getGithubVerifiedUser = async (
    code: string,
    userType?: UserTypeEnum,
    isSignup?: boolean,
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
      isSignup,
    );
  };

  public getGoogleVerifiedUser = async (
    token: string,
    userType: UserTypeEnum,
    isSignup?: boolean,
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
        isSignup,
      );
    } catch (_err) {
      throw _err;
    }
  };

  private postVerifiedOAuthUser = async (
    verifiedUser: object,
    source: OAuthClients,
    userType: UserTypeEnum,
    isSignup?: boolean,
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
      // /login and /signup hit this same path — only /signup sets
      // is_signup, so a login attempt for an email with no account errors
      // instead of silently creating one.
      if (!isSignup) {
        throw new Error("No account found. Please sign up first.");
      }

      // Brands no longer create accounts via OAuth — they use the dedicated
      // brand signup form. Existing OAuth-created brand accounts (if any)
      // still log in fine via the `existingValidUser` branch above; this
      // only blocks *new* brand accounts from this path.
      if (userType === UserTypeEnum.BRAND) {
        throw new Error("Can't signup for brand");
      }

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
