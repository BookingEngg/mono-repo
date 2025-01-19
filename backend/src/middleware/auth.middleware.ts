import { Request, Response, NextFunction } from "express";
import UserDao from "@/dao/user.dao";
import JwtService from "@/services/jwt.service";
import { RolesAccessibilityWithRoles } from "@/constants/common.constants";

class AuthMiddleware {
  private jwtService = new JwtService();
  private userDao = new UserDao();

  public getAuthUser = () => {
    return async (req: Request, _: Response, next: NextFunction) => {
      try {
        const token = this.jwtService.getJwtToken(req);
        console.log("TOKEN>>>>", token)
        if (!token) {
          throw new Error("Token not found");
        }
        const { email } = this.jwtService.verifyToken(token);

        if (!email) {
          throw new Error("Invalid Token");
        }

        const userData = await this.userDao.getUserByEmail(email);
        req.user = userData;
        next();
      } catch (error) {
        req.user = null;
        next();
      }
    };
  };

  public checkRoles = (roles: string[]) => {
    return async (req: Request, _: Response, next: NextFunction) => {
      const user = req.user;

      // Roles which are assigned by the system in DB
      const userRoles = user.roles || [];

      // Check the role assign and the level of the user
      let allRoles = [];
      roles.forEach((role) => {
        const allUserRoles = userRoles.filter((u_role) => {
          return RolesAccessibilityWithRoles[u_role]?.includes(role);
        });

        allRoles = [...allRoles, ...allUserRoles];
      });

      if (allRoles.length) {
        next(new Error("Authentication Error"));
      }
    };
  };
}

export default AuthMiddleware;
