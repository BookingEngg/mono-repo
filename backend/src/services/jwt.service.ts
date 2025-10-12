import { tokenDetails } from "@/config";
import { Request, Response } from "express";
import JWT from "jsonwebtoken";

class JwtService {
  private jwt = JWT;

  public createToken = (data: object) => {
    return this.jwt.sign(JSON.stringify(data), tokenDetails.secret_key);
  };

  public verifyToken = (token: string) => {
    return this.jwt.verify(token, tokenDetails.secret_key);
  };

  public getJwtToken = (req: Request): string => {
    const tokenCookie = req.headers["cookie"];
    const tokenKey = "jwt-token";
    const cookieSplit = tokenCookie.split(";");

    for (let cookie of cookieSplit) {
      cookie = cookie.trim();
      if (cookie.startsWith(tokenKey + "=")) {
        return cookie.substring(tokenKey.length + 1);
      }
    }

    return null;
  };

  public setCookieAtClientSide = (payload: {
    res: Response;
    cookieDetails: {
      verifiedUser: boolean;
      jwtToken: string;
    };
  }) => {
    const { res, cookieDetails } = payload;

    if (!cookieDetails || !cookieDetails?.jwtToken) {
      throw new Error("Invalid Login");
    }
    res.cookie("jwt-token", cookieDetails.jwtToken, {
      maxAge: 1000 * 60 * 60 * 24 * (tokenDetails.token_ttl_max_days || 10), // Default 10 Days JWT Expire
      secure: true,
      sameSite: "none",
    });
  };
}

export default JwtService;
