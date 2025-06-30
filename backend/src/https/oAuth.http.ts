// import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { fetch } from "@/util/utils.util";

class OAuthHttp {
  public getAccessToken = async (payload: {
    clientId: string;
    clientSecret: string;
    requestToken: string;
  }) => {
    const { clientId, clientSecret, requestToken } = payload;

    const response = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${requestToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const text = await response.text();
    const params = new URLSearchParams(text);
    const data = Object.fromEntries(params.entries());
    return data;
  };

  public getAuthorizedUser = async (accessToken: string) => {
    try {
      const response = await fetch("https://api.github.com/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const text = await response.text();
      return JSON.parse(text);
    } catch (_) {
      return null;
    }
  };

  public getUserEmails = async (accessToken: string) => {
    try {
      const response = await fetch("https://api.github.com/user/emails", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const text = await response.text();
      return JSON.parse(text);
    } catch (_) {
      return null;
    }
  };
}

export default OAuthHttp;
