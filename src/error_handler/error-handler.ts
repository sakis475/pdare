import e, { NextFunction, Request, Response } from 'express';
import { ErrorCode } from './error-code';
import { ErrorModel } from './error-model';
import { ErrorException } from './error-exception';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  if (!err) {
    return next();
  }
  if (err instanceof ErrorException) {
    return res.status(err.code).json(err);
  } else {
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
      console.error(err);

      if (err instanceof ErrorModel) {
        return res.status(err.code).json(err);
      } else {
        switch (err.code) {
          case '23505':
            return res.status(ErrorCode.SQLDuplicate.code).json({
              message: ErrorCode.SQLDuplicate.message,
              code: ErrorCode.SQLDuplicate.code,
            });
        }

        //custom throw error
        if (err.message && err.code) {
          return res.status(500).json({
            message: err.message,
            code: err.code,
          });
        }

        // unhandled errors returns with 500 status
        return res.status(500).json({
          message: ErrorCode.UnknownError.message,
          code: 500,
        });
      }
    });
  };

export const customResponseError = (
  res: Response,
  statusCode: number,
  errorMessage: string
) => {
  console.log(statusCode, errorMessage);
  return res
    .status(statusCode)
    .json({ message: errorMessage, code: statusCode });
};
