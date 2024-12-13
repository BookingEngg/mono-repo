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

  public getJwtToken = (req: Request) => {
    const tokenString = (req.headers?.cookie ||
      req.headers?.["tcookie"]) as string;
    return tokenString?.split("=")?.[1];
  };

}

export default JwtService;
