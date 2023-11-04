import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { AdminService } from '../services/admin.service';
import { passwordHash } from '../auth/password-hash';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function createRestaurantAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, firstName, lastName, restaurantName } = req.body;

  if (!username || !firstName || !lastName || !restaurantName) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const adminService = new AdminService();

  const password = Math.random().toString(36).slice(-8).toUpperCase();
  const passwordHashed = passwordHash(password);

  //only for dev
  console.log(password, 'password hashed');

  const newUser = { username, firstName, lastName, passwordHashed };
  const newRestaurant = { restaurantName };

  await adminService.createOwnerAndRestaurant(newUser, newRestaurant);

  res.json();
}
