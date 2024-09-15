import { NextFunction, Request, Response } from "express";

import { ErrorCode } from "../error_handler/error-code";
import { verifyToken } from "./jwt";
import { User } from "../database/entity/User.entity";
import { UserService } from "../services/user.service";
import { ErrorException } from "../error_handler/error-exception";
import { UserType } from "../database/interfaces";

export const basicAuthMiddleware = async (
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
        return next(new ErrorException(ErrorCode.JWTExpired));
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

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await basicAuthMiddleware(req, res, (err?: any) => {
      if (err) {
        return next(err);
      }

      userHasRestaurantMiddleware(req, res, next);
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorException(ErrorCode.ServerError));
  }
};

export const authOwnerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await userHasRestaurantMiddleware(req, res, (err?: any) => {
      if (err) {
        return next(err);
      }

      if (res.locals.user.role !== UserType.OWNER) {
        return next(new ErrorException(ErrorCode.NoPermission));
      }

      return next();
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorException(ErrorCode.ServerError));
  }
};

export const userHasRestaurantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.user.restaurant) {
      return next(new ErrorException(ErrorCode.UserNoRestaurant));
    } else {
      return next();
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
