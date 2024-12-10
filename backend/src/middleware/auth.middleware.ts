import { Request, Response, NextFunction } from "express";
import UserDao from "@/dao/user.dao";
import JwtService from "@/services/jwt.service";
import { IUser } from "@/interfaces/user.interface";

class AuthMiddleware {
  private jwtService = new JwtService();
  private userDao = new UserDao();

  public getAuthUser = () => {
    let tokenData: { email: number } | null;
    return async (req: Request, _: Response, next: NextFunction) => {
      const token = req.header["authorization"];
      if (!token) {
        throw new Error("Token not found");
      }

      tokenData = this.jwtService.verifyToken(token);
      const { email } = tokenData;
      if (!email) {
        throw new Error("Invalid Token");
      }
      // const userData = await this.userDao.getUserByEmail(email);
      // req.user = userData;

      next();
    };
  };

  public checkRoles = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userRoles = req.user.roles || [];

      if (userRoles.find((role) => roles.indexOf(role) > -1).length) {
        return next();
      }

      next(new Error("Authorization Error"));
    };
  };
}

export default AuthMiddleware;
