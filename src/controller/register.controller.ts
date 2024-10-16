import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword, passwordHash } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';
import { UserType } from '../database/interfaces';
import { User } from '../database/entity/User.entity';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function postRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, email, password, firstName, lastName, role } = req.body;

  if (!username || !email || !password || !firstName || !lastName || !role) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const userService = new UserService();

  const passwordHashed = passwordHash(password);

  const newUserData = { username, email, firstName, lastName, passwordHashed };
  const token = generateAuthToken(newUserData);

  const newuser = await userService.saveUser({
    ...newUserData,
    token: token.token,
    role,
  });
  delete newuser['passwordHashed'];
  res.json(generateAuthToken(newuser));
}
