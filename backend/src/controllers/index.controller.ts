import { Request, Response } from "express";

class IndexController {
  public healthController = async (_req: Request, res: Response): Promise<any> => { 
    // TODO: need to remove any
    return res.send({ message: "success" });
  };

  public test = () => {
    return "Hello World from controller";
  };
}

export default IndexController;
