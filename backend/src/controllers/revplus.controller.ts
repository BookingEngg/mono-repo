import { Request, Response } from "express";
import RevplusService from "@/services/revplus.service";

class RevplusController {
  private revPlusService = new RevplusService();

  public newLeadRequest = async (req: Request, res: Response): Promise<any> => {
    const { email, user_agent, ip_address } = req.body as {
      email: string;
      user_agent: string;
      ip_address: string;
    };

    await this.revPlusService.createLead({ email, user_agent, ip_address });
    return res.send({ status: "success" });
  };
}

export default RevplusController;
