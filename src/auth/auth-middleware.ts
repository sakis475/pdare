import { NextFunction, Request, Response } from "express";

import { ErrorCode } from "../error_handler/error-code";
import { verifyToken } from "./jwt";
import { User } from "../database/entity/User.entity";
import { OrderService } from "../services/order.service";
import { UserService } from "../services/user.service";
import { catchWrapper } from "../error_handler/error-handler";
import { ErrorException } from "../error_handler/error-exception";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // if (process.env.ENV_TYPE === "DEV") {
    //   const userService = new UserService();
    //   const user = await userService.getUserByID(5);
    //   res.locals.user = user;
    //   return next();
    // }

    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer") && auth.split(" ").length > 1) {
      const token = auth.split(" ")[1]; //auth looks like this "Bearer a1Ddsa21f2312..."

      let userJWT: Partial<User> = null;
      try {
        // @ts-ignore
        userJWT = verifyToken(token);
      } catch (error) {
        return next(new ErrorException(ErrorCode.JWTExpired));
      }

      if (!userJWT?.username)
        return next(new ErrorException(ErrorCode.Unauthorized));

      const userService = new UserService();

      const user = await userService.getUserByJWT(token);

      if (!user || !user.active) {
        return next(new ErrorException(ErrorCode.NoUserOrDisabledError));
      }

      if (!user.restaurant) {
        return next(new ErrorException(ErrorCode.UserNoRestaurant));
      }

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
export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // if (process.env.ENV_TYPE === "DEV") {
    //   const userService = new UserService();
    //   const user = await userService.getUserByID(5);
    //   res.locals.user = user;
    //   return next();
    // }

    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer") && auth.split(" ").length > 1) {
      const token = auth.split(" ")[1]; //auth looks like this "Bearer a1Ddsa21f2312..."

      if (token === process.env.ADMIN_TOKEN) {
        return next();
      } else {
        return next(new ErrorException(ErrorCode.Unauthorized));
      }
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorException(ErrorCode.ServerError));
  }
};
