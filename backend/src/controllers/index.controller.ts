import { Request, Response } from "express";
import { MONGO_INSTANCES } from "@/database";
import { sequelize } from "@/database/postgres";

class IndexController {
  public healthController = async (
    req: Request<{}, {}, {}, { db: string | boolean }>,
    res: Response,
  ): Promise<any> => {
    const { db } = req.query;
    const checkDb = db === true || db === "true";

    if (!checkDb) {
      // TODO: need to remove any
      return res.send({ message: "success" });
    }

    const mongoConnected = MONGO_INSTANCES["praman"]?.readyState === 1;

    let postgresConnected = true;
    try {
      await sequelize.authenticate();
    } catch {
      postgresConnected = false;
    }

    const healthy = mongoConnected && postgresConnected;

    return res.status(healthy ? 200 : 503).send({
      message: healthy ? "success" : "failure",
      database: {
        mongo: mongoConnected ? "up" : "down",
        postgres: postgresConnected ? "up" : "down",
      },
    });
  };

  public dichkaController = async (
    req: Request<
      {},
      {},
      {},
      {
        secure: string | boolean;
        token: string;
        same_site: "lax" | "strict" | "none";
        is_cookie_testing: string | boolean;
      }
    >,
    res: Response,
  ): Promise<any> => {
    const { secure, token, same_site, is_cookie_testing } = req.query;

    if (is_cookie_testing === true || is_cookie_testing === "true") {
      res.cookie("jwt-token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 10, // Default 10 Days JWT Expire
        secure: secure === true || secure === "true",
        sameSite: same_site,
      });
    }

    // Get all the headers
    return res.send({
      status: "success",
      query: req.query,
      headers: req.headers,
      cookie: req.headers["cookie"],
    });
  };
}

export default IndexController;
