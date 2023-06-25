import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { comparePassword, passwordHash } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserModel } from '../database/model/user.model';
// import { usersDB } from '../model/db/users.db';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function postRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, firstName, lastName, password } = req.body;

  if (!username || !password || !firstName || !lastName) {
    return next(new ErrorException(ErrorCode.NoNameOrPassword));
  }
  const userModel = new UserModel();

  const passwordHashed = passwordHash(password);

  const newuser = await userModel.saveUser({
    username,
    firstName,
    lastName,
    passwordHashed
  });

  delete newuser['passwordHashed'];

  res.json(generateAuthToken(newuser));
}
