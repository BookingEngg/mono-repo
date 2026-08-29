import { Request, Response } from "express";
import HomeService from "@/services/home.service";

class HomeControllers {
  private homeService = new HomeService();

  /**
   * Widgets for the signed-in account's home screen. Which ones come back is
   * decided server-side from the caller's roles.
   */
  public getHomeWidgets = async (req: Request, res: Response): Promise<any> => {
    if (!req.user) {
      throw new Error("User not found");
    }

    const widgets = await this.homeService.getHomeWidgets(req.user);
    return res.send({ status: "success", data: { widgets } });
  };
}

export default HomeControllers;
