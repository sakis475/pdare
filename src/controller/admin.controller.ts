import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { AdminService } from '../services/admin.service';
import { passwordHash } from '../auth/password-hash';
import { UserService } from '../services/user.service';
import { RestaurantService } from '../services/restaurant.service';
import { customResponseError } from '../error_handler/error-handler';
import { io } from '../server';
import { TableService } from '../services/table.service';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function createRestaurantAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, email, firstName, lastName, restaurantName } = req.body;

  if (!username || !email || !firstName || !lastName || !restaurantName) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const userService = new UserService();
  const userExists = await userService.getUserByEmailOrUsername(
    username,
    email
  );

  if (userExists) {
    return customResponseError(
      res,
      400,
      'User already exists with that name/email'
    );
  }

  const restaurantService = new RestaurantService();

  const restaurantNameExists = await restaurantService.getRestaurantByName(
    restaurantName
  );

  if (restaurantNameExists) {
    return customResponseError(res, 400, 'Restaurant name already exists');
  }

  const adminService = new AdminService();

  const password = Math.random().toString(36).slice(-8).toUpperCase();
  const passwordHashed = passwordHash(password);

  //only for dev

  console.log(password, 'password hashed');

  const newUser = { username, email, firstName, lastName, passwordHashed };
  const newRestaurant = { restaurantName };

  await adminService.createOwnerAndRestaurant(newUser, newRestaurant);

  res.json();
}

export async function testio(req: Request, res: Response, next: NextFunction) {
  console.log('testio executed');
  const tableService = new TableService();
  const restaurantService = new RestaurantService();
  const restaurant = await restaurantService.getRestaurantById(1);
  const tables = await tableService.getEnabledTablesWithOrder(restaurant);
  io.emit('testio', tables);
  res.json();
}
