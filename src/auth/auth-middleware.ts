import { NextFunction, Request, Response } from "express";

import { ErrorCode } from "../error_handler/error-code";
import { verifyToken } from "./jwt";
import { User } from "../database/entity/User";
import { OrderModel } from "../database/model/order.model";
import { UserModel } from "../database/model/user.model";
import { catchWrapper } from "../error_handler/error-handler";
import { ErrorException } from "../error_handler/error-exception";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer") && auth.split(" ").length > 1) {
      const token = auth.split(" ")[1]; //auth looks like this "Bearer a1Ddsa21f2312..."

      let userJWT: Partial<User> = null;
      try {
        //@ts-ignore
        userJWT = verifyToken(token);
      } catch (error) {
        return next(new ErrorException(ErrorCode.JWTExpired));
      }

      if (!userJWT?.username)
        return next(new ErrorException(ErrorCode.Unauthorized));

      const userModel = new UserModel();

      const user = await userModel.getUserByJWT(token);

      if (!user) return next(new ErrorException(ErrorCode.JWTExpired));

      res.locals.user = user;
      return next();
    } else {
      return next(new ErrorException(ErrorCode.Unauthorized));
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorException(ErrorCode.ServerError));
  }
};
