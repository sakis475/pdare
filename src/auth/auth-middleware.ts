import { Request, Response } from 'express';

import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { verifyToken } from './jwt';

export const authMiddleware = (req: Request, res: Response, next: any) => {
  const auth = req.headers.authorization;

  if (auth && auth.startsWith('Bearer')) {
    const token = auth.split(' ')[1]; //auth looks like this "Bearer a1Ddsa21f2312..."

    try {
      const tokenData = verifyToken(token);
      req.body.tokenData = tokenData;
      next();
    } catch (error) {
      throw new ErrorException(ErrorCode.Unauthorized);
    }
  } else {
    throw new ErrorException(ErrorCode.Unauthorized);
  }
};
