import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword } from '../auth/password-hash';
import { generateAuthToken, verifyToken } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';

export async function postLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(
      new ErrorException(new ErrorException(ErrorCode.NoNameOrPassword))
    );
  }
  const userService = new UserService();

  const user = await userService.getUserByEmailOrUsername(
    username,
    undefined,
    true
  );
  if (!user || !user.active) {
    return next(new ErrorException(ErrorCode.NoUserOrDisabledError));
  }

  if (!comparePassword(password, user.passwordHashed)) {
    return next(new ErrorException(ErrorCode.WrongPasswordError));
  }

  const tokenJWT = generateAuthToken(user);

  user.token = tokenJWT.token;

  await userService.saveUser(user);

  console.log(tokenJWT);

  delete user.token;
  delete user.passwordHashed;
  const responseData = { ...tokenJWT, user };
  res.json(responseData);
}

export async function postRefreshSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { jwt } = req.body;

  if (!jwt) {
    return next(new ErrorException(ErrorCode.WrongPasswordError));
  }

  try {
    //throws error if not verified
    verifyToken(jwt);
  } catch (error) {
    console.log(error, 'verifyToken');
    return next(new ErrorException(ErrorCode.JWTExpired));
  }

  const userService = new UserService();

  const user = await userService.getUserByJWT(jwt);
  console.log(user, 'user');
  if (!user) {
    return next(new ErrorException(ErrorCode.JWTExpired));
  }

  const tokenJWT = generateAuthToken(user);

  user.token = tokenJWT.token;

  await userService.saveUser(user);

  console.log(tokenJWT);
  delete user.token;
  delete user.passwordHashed;
  const responseData = { ...tokenJWT, user };
  res.json(responseData);
}
