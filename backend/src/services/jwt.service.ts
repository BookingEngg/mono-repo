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
    if (!tokenCookie?.includes("jwt-token")) {
      return "";
    }

    return tokenCookie.slice("jwt-token=".length) || "";
  };
}

export default JwtService;
