import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

class ValidatorMiddleware {
  /**
   * Validates request body against the provided zod schema, and replaces
   * req.body with the parsed (defaulted, coerced) result on success.
   */
  public validateRequestBody(zodSchema: z.ZodTypeAny) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.body = zodSchema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(501).json({ status: "error", errors: error.issues });
          return;
        }
        next(error);
      }
    };
  }

  public validateRequestParams(zodSchema: z.ZodTypeAny) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.params = zodSchema.parse(req.params) as typeof req.params;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(501).json({ status: "error", errors: error.issues });
          return;
        }
        next(error);
      }
    };
  }

  public validateRequestQuery(zodSchema: z.ZodTypeAny) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.query = zodSchema.parse(req.query) as typeof req.query;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(501).json({ status: "error", errors: error.issues });
          return;
        }
        next(error);
      }
    };
  }
}

export default ValidatorMiddleware;
