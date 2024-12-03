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
  const { email, password } = req.body;

  const username = email?.split('@')?.[0];
  if (!username || !email || !password) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const userService = new UserService();

  const passwordHashed = passwordHash(password);

  const newUserData: User = {
    username,
    email,
    passwordHashed,
    role: UserType.GUEST,
  };
  const tokenJWT = generateAuthToken(newUserData);

  newUserData.token = tokenJWT.token;
  const newuser = await userService.saveUser(newUserData);

  delete newuser.token;
  delete newuser.passwordHashed;

  res.json({ ...tokenJWT, user: newuser });
}
