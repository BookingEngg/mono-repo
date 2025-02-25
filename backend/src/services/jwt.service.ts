import { tokenSecretKey } from "@/config";
import { Request } from "express";
import JWT from "jsonwebtoken";

class JwtService {
  private jwt = JWT;

  public createToken = (data: object) => {
    return this.jwt.sign(JSON.stringify(data), tokenSecretKey);
  };

  public verifyToken = (token: string) => {
    return this.jwt.verify(token, tokenSecretKey);
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
}

export default JwtService;
