import { Request, Response } from "express";
import CreatorHubService from "@/services/creatorHub.service";
import { appendUtmParams } from "@/helper/creatorHub.helper";
import { nanoid } from "nanoid";
import { IListJobsQuery } from "@/validators/creatorHub.validator";

const SESSION_ID_COOKIE = "creator_session_id";

class CreatorHubControllers {
  private creatorHubService = new CreatorHubService();

  /**
   * Brand lists a new job against a product
   */
  public createJob = async (req: Request, res: Response): Promise<any> => {
    const brand = req.user;
    if (!brand) {
      throw new Error("User not found");
    }

    const job = await this.creatorHubService.createJob(brand, req.body);
    return res.send({ status: "success", data: job });
  };

  /**
   * Influencer's explore feed — every active job across all brands.
   */
  public listJobsForInfluencer = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    const { page, limit } = req.query as unknown as IListJobsQuery;
    const result = await this.creatorHubService.listJobsForInfluencer({
      page,
      limit,
    });

    return res.send({ status: "success", ...result });
  };

  /**
   * A brand's own posted jobs only.
   */
  public listJobsForBrand = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user?._id) {
      throw new Error("User not found");
    }

    const { page, limit } = req.query as unknown as IListJobsQuery;
    const result = await this.creatorHubService.listJobsForBrand(req.user._id, {
      page,
      limit,
    });

    return res.send({ status: "success", ...result });
  };

  /**
   * Job detail for the influencer's checkout/apply-summary screen.
   */
  public getJobCheckoutDetails = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    const details = await this.creatorHubService.getJobCheckoutDetails(
      req.params.shortId,
    );
    return res.send({ status: "success", data: details });
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
   * Every job application the influencer has made.
   */
  public listJobApplicationsForInfluencer = async (
    req: Request,
    res: Response,
  ): Promise<any> => {
    if (!req.user?._id) {
      throw new Error("User not found");
    }

    const { page, limit } = req.query as unknown as IListJobsQuery;
    const result =
      await this.creatorHubService.listJobApplicationsForInfluencer(
        req.user._id,
        { page, limit },
      );

    return res.send({ status: "success", ...result });
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
