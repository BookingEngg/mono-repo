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
    _req: Request,
    res: Response
  ): Promise<any> => {
    // Get all the headers
    return res.send({
      status: "success",
      headers: _req.headers,
      cookie: _req.headers["cookie"],
    });
  };
}

export default IndexController;
