import { ICommonAuthUser } from "@/interfaces/user.interface";
import { TokenPayload } from "google-auth-library";

class OAuthFormatter {
  public getFormattedGoogleUserDetails = (payload: TokenPayload) => {
    return {
      first_name: payload.given_name,
      last_name: payload.family_name,
      email: payload.email,
      email_verified: payload.email_verified,
      user_profile_picture: payload.picture,
    };
  };

  public getFormattedGithubUserDetails = (payload: object): ICommonAuthUser => {
    return {
      first_name: payload["name"],
      last_name: "",
      email: payload["email"],
      email_verified: true,
      user_profile_picture: payload["avatar_url"],
    };
  };
}

export default OAuthFormatter;
