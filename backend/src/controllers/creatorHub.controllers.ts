import { Request, Response } from "express";
import CreatorHubService from "@/services/creatorHub.service";
import { appendUtmParams } from "@/helper/creatorHub.helper";
import { nanoid } from "nanoid";

const SESSION_ID_COOKIE = "creator_session_id";

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
      req.body,
    );
    return res.send({ status: "success", data: application });
  };

  /**
   * Resolve a redirection link's short_id and redirect to its destination
   */
  public redirectLink = async (
    req: Request<{ shortId: string }>,
    res: Response,
  ): Promise<any> => {
    try {
      let sessionId = req.cookies?.[SESSION_ID_COOKIE];

      if (!sessionId) {
        sessionId = nanoid(10);
        res.cookie(SESSION_ID_COOKIE, sessionId, {
          maxAge: 1000 * 60 * 60, // 1 hour
          secure: true,
          sameSite: "none",
        });
      }

      const { destinationUrl, jobApplicationShortId } =
        await this.creatorHubService.resolveLinkClick(
          req.params.shortId,
          sessionId,
        );

      return res.redirect(
        302,
        appendUtmParams(destinationUrl, jobApplicationShortId, sessionId),
      );
    } catch (error) {
      return res
        .status(404)
        .json({ status: "error", message: "Link not found" });
    }
  };

  /**
   * Brand reports a conversion event (PDP_VIEW, ORDER_PLACED, etc.) for a visitor
   */
  public recordConversion = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    await this.creatorHubService.recordConversion(req.body);
    return res.send({ status: "success" });
  };
}

export default CreatorHubControllers;
