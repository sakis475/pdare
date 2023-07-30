import e, { NextFunction, Request, Response } from "express";
import { ErrorCode } from "./error-code";
import { ErrorModel } from "./error-model";
import { ErrorException } from "./error-exception";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!err) {
    return next();
  }
  if (err instanceof ErrorException) {
    return res.status(err.code).json(err);
  } else {
    console.log(err);

    // unhandled errors returns with 500 status
    return res.status(500).json({
      message: ErrorCode.UnknownError.message,
      code: 500,
    });
  }
};

export const catchWrapper =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (err instanceof ErrorModel) {
        return res.status(err.code).json(err);
      } else {
        console.log(err);

        // unhandled errors returns with 500 status
        return res.status(500).json({
          message: ErrorCode.UnknownError.message,
          code: 500,
        });
      }
    });
  };
