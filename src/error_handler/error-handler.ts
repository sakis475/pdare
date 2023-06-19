import { Request, Response } from 'express';
import { ErrorCode } from './error-code';
import { ErrorException } from './error-exception';
import { ErrorModel } from './error-model';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: any
) => {
  if (err instanceof ErrorException) {
    res.status(err.status).json(err);
  } else {
    console.log(err);

    // unhandled errors returns with 500 status
    res
      .status(500)
      .json({ code: ErrorCode.UnknownError, status: 500 } as ErrorModel);
  }
};
