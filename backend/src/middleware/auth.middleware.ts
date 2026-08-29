import { Request, Response, NextFunction } from "express";
import UserDao from "@/dao/user.dao";
import JwtService from "@/services/jwt.service";
import { RolesAccessibilityWithRoles } from "@/constants/common.constants";
import {
  AccountStatusEnum,
  privilegesEnum,
  rolesEnum,
} from "@/interfaces/enum";

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

  /**
   * Blocks anything an account isn't fully activated for. A brand only
   * reaches ACTIVE once its security deposit settles, so this is what keeps
   * an unpaid brand from posting jobs it has no budget to fund.
   *
   * Separate from checkRoles because it's a lifecycle gate, not a permission
   * one: the account has the right role and privilege, it just isn't ready
   * yet — hence 403 with a distinguishable message rather than a generic
   * "Permission denied".
   */
  public requireActiveAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Invalid Token for User" });
    }

    if (user.account_status !== AccountStatusEnum.ACTIVE) {
      return res.status(403).json({
        message:
          "Complete your security deposit to activate your account before posting a job.",
        account_status: user.account_status,
      });
    }

    next();
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
