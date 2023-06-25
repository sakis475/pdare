import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { comparePassword } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserModel } from '../database/model/user.model';
// import { usersDB } from '../model/db/users.db';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function postLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ErrorException(ErrorCode.NoNameOrPassword));
  }
  const userModel = new UserModel();
  const user = await userModel.getUserByUsername(username);

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  if (!comparePassword(password, user.passwordHashed)) {
    return next(new ErrorException(ErrorCode.WrongPasswordError));
  }

  res.json(generateAuthToken(user));
}
