import { Request, Response, NextFunction } from "express";
import UserDao from "@/dao/user.dao";
import JwtService from "@/services/jwt.service";
import { RolesAccessibilityWithRoles } from "@/constants/common.constants";
import { privilegesEnum, rolesEnum } from "@/interfaces/enum";

class AuthMiddleware {
  private jwtService = new JwtService();
  private userDao = new UserDao();

  public getAuthUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const token = this.jwtService.getJwtToken(req);

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
      return res.status(401).json({ message: "Invalid Token for User" });
    }
  };

  public checkRoles = (roles: rolesEnum[], priviledges: privilegesEnum[]) => {
    return async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<any> => {
      try {
        const user = req.user;

        if (!user) {
          return res.status(401).json({ message: "Invalid Token for User" });
        }

        // Roles which are assigned by the system in DB
        const assignedUserRoles = user.roles || [];
        const assignedUserPrivileges = user.privileges || [];

        const hasAllRoles = roles.every((role) =>
          assignedUserRoles.includes(role),
        );
        if (!hasAllRoles) {
          return res.status(403).json({ message: "Permission denied" });
        }

        const hasAllPrivileges = priviledges.every((priviledge) =>
          assignedUserPrivileges.includes(priviledge),
        );
        if (!hasAllPrivileges) {
          return res.status(403).json({ message: "Permission denied" });
        }

        next();
      } catch (err) {
        return res.status(401).json({ message: "Invalid Permission for User" });
      }
    };
  };
}

export default AuthMiddleware;
