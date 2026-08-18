import { NextFunction, Request, Response } from "express";

/**
 * Catches whatever asyncWrapper forwards via next(error) so a thrown error
 * (e.g. JwtService.setCookieAtClientSide's "Invalid Login") reaches the
 * client as clean JSON instead of Express's default handler, which dumps the
 * raw stack trace as the response body.
 *
 * Must be registered LAST, after every route, and must keep all four
 * parameters — Express only recognizes a middleware as an error handler when
 * its callback signature has an arity of 4.
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error(error);
  res.status(500).send({ message: error.message || "Something went wrong", status: false });
};

export const asyncWrapper = (
  controllerFunction: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Express.Response> | Promise<void>
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req, res, next) => {
    try {
      await controllerFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
