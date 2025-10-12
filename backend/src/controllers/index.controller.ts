import { Request, Response } from "express";

class IndexController {
  public healthController = async (
    _req: Request,
    res: Response
  ): Promise<any> => {
    // TODO: need to remove any
    return res.send({ message: "success" });
  };

  public dichkaController = async (
    req: Request<
      {},
      {},
      {},
      { secure: boolean; token: string; same_site: "lax" | "strict" | "none" }
    >,
    res: Response
  ): Promise<any> => {
    const { secure, token, same_site } = req.query;

    res.cookie("jwt-token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 10, // Default 10 Days JWT Expire
      secure: secure,
      sameSite: same_site,
    });

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
