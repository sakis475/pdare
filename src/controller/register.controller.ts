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
  const { username, firstName, lastName } = req.body;

  if (res.locals.user?.role !== UserType.ADMIN) {
    return next(new ErrorException(ErrorCode.Unauthorized));
  }

  if (!res.locals.user.restaurant) {
    return next(new ErrorException(ErrorCode.ContactAdminError));
  }

  if (!username || !firstName || !lastName) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const adminUser: User = res.locals.user.restaurant;

  const userService = new UserService();

  const password = Math.random().toString();
  //TODO: create a temp password, email will be
  //send to user to change password with username and tempPass
  const passwordHashed = passwordHash(password);

  console.log(password, 'password hashed');

  const newUserData = { username, firstName, lastName, passwordHashed };

  const token = generateAuthToken(newUserData);

  const newuser = await userService.saveUser({
    ...newUserData,
    token,
    restaurant: adminUser.restaurant
  });

  delete newuser['passwordHashed'];

  res.json(generateAuthToken(newuser));
}
