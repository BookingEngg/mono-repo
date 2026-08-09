import { Request, Response } from "express";
import { nanoid } from "nanoid";
import CreatorHubService from "@/services/creatorHub.service";
import { appendUtmParams } from "@/helper/creatorHub.helper";

const VISITOR_ID_COOKIE = "visitor_id";

class CreatorHubControllers {
  private creatorHubService = new CreatorHubService();

  /**
   * Brand lists a new job against a product
   */
  public createJob = async (req: Request, res: Response): Promise<any> => {
    const job = await this.creatorHubService.createJob(req.body);
    return res.send({ status: "success", data: job });
  };

  /**
   * Influencer applies for a job
   */
  public applyForJob = async (req: Request, res: Response): Promise<any> => {
    if (!req.user?._id) {
      throw new Error("Invalid User");
    }

    const application = await this.creatorHubService.applyForJob(
      req.user._id,
      req.body
    );
    return res.send({ status: "success", data: application });
  };

  /**
   * Resolve a redirection link's short_id and redirect to its destination
   */
  public redirectLink = async (
    req: Request<{ shortId: string }>,
    res: Response
  ): Promise<any> => {
    try {
      const destinationUrl = await this.creatorHubService.getLinkDestination(
        req.params.shortId
      );

      let visitorId = req.cookies?.[VISITOR_ID_COOKIE];
      if (!visitorId) {
        visitorId = nanoid(20);
        res.cookie(VISITOR_ID_COOKIE, visitorId, {
          maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year, so repeat clicks resolve to the same visitor
          secure: true,
          sameSite: "none",
        });
      }

      return res.redirect(302, appendUtmParams(destinationUrl, visitorId));
    } catch (error) {
      return res.status(404).json({ status: "error", message: "Link not found" });
    }
  };
}

export default CreatorHubControllers;
