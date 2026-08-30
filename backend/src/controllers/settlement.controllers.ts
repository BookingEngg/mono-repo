import { Request, Response } from "express";
import SettlementService from "@/services/settlement.service";

class SettlementControllers {
  private settlementService = new SettlementService();

  /** Settled vs pending, grouped by the brand's jobs. */
  public getSettlementByJob = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user) {
      throw new Error("User not found");
    }

    const data = await this.settlementService.getSettlementByJob(req.user);
    return res.send({ status: "success", ...data });
  };

  /** Settled vs pending, grouped by the creators who earned from the brand. */
  public getSettlementByCreator = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user) {
      throw new Error("User not found");
    }

    const data = await this.settlementService.getSettlementByCreator(req.user);
    return res.send({ status: "success", ...data });
  };
}

export default SettlementControllers;
