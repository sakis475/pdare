import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';
// import { usersDB } from '../model/db/users.db';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
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
  const user = await userService.getUserByUsername(username);

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserOrDisabledError));
  }

  if (!comparePassword(password, user.passwordHashed)) {
    return next(new ErrorException(ErrorCode.WrongPasswordError));
  }

  const tokenJWT = generateAuthToken(user);

  user.token = tokenJWT;

  await userService.saveUser(user);

  res.json(tokenJWT);
}
