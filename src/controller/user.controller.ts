import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword, passwordHash } from '../auth/password-hash';
import { generateAuthToken, prepareUserSessionBearer } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';
import { UserType } from '../database/interfaces';
import { User } from '../database/entity/User.entity';
import { InvitationRequestService } from '../services/invitationRequest.service';
import { InvitationRequestStatus } from '../database/entity/InvitationRequest.entity';
import { RestaurantService } from '../services/restaurant.service';
import { isEmailValid, isPasswordValid } from '../lib/helpers/formUtils';

const restaurantService = new RestaurantService();
const userService = new UserService();

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  if (!user.restaurant) {
    return next(new ErrorException(ErrorCode.UserNoRestaurant));
  }

  const allNoOwnerUsers = await userService.getUsersByRestaurant(
    user.restaurant,
    true
  );
  res.json(allNoOwnerUsers);
}

export async function searchUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  const searchKeyword: string = req.query.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 5;

  if (
    !searchKeyword ||
    typeof searchKeyword !== 'string' ||
    searchKeyword.length < 3
  ) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  if (!user.restaurant) {
    return next(new ErrorException(ErrorCode.UserNoRestaurant));
  }

  const paginatedResults = await userService.searchUsers(searchKeyword, {
    page,
    limit,
  });
  res.json(paginatedResults);
}

export async function sendInvitationToJoinRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username } = req.body;

  if (!username) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const ownerUser: User = res.locals.user;

  if (ownerUser.role !== UserType.OWNER) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  const user = await userService.getUserByUsername(username);

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  if (user.id === ownerUser.id) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  if (user.restaurant?.id === ownerUser.restaurant.id) {
    return next(new ErrorException(ErrorCode.UserAlreadyExists));
  }

  const invitationRequestService = new InvitationRequestService();

  const existingInvitation =
    await invitationRequestService.getRequestByInvitedUsername(user, true);

  if (existingInvitation) {
    return next(new ErrorException(ErrorCode.RequestAlreadyExists));
  }

  const newInvitation = invitationRequestService.createInvitationRequest(
    ownerUser,
    user,
    ownerUser.restaurant
  );

  await invitationRequestService.saveRequest(newInvitation);
  res.json();
}

export async function cancelInvitationToJoinRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username } = req.body;

  if (!username) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const ownerUser: User = res.locals.user;

  if (ownerUser.role !== UserType.OWNER) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  const user = await userService.getUserByUsername(username);

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  const invitationRequestService = new InvitationRequestService();

  const invitedUserInvitation =
    await invitationRequestService.getRequestByInvitedUsername(user, true);

  if (!invitedUserInvitation) {
    return next(new ErrorException(ErrorCode.RequestNotFound));
  }

  await invitationRequestService.updateRequest(invitedUserInvitation.id, {
    invitationStatus: InvitationRequestStatus.CANCELLED,
  });

  res.json();
}

export async function waiterAcceptsInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username } = req.body;

  if (!username) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const ownerUser: User = res.locals.user;

  if (ownerUser.role !== UserType.OWNER) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  const user = await userService.getUserByUsername(username);

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  if (user.restaurant.id === ownerUser.restaurant.id) {
    return next(new ErrorException(ErrorCode.UserAlreadyExists));
  }

  const invitationRequestService = new InvitationRequestService();

  invitationRequestService.createInvitationRequest(
    ownerUser,
    user,
    ownerUser.restaurant
  );
}

export async function createNewRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { restaurantName }: { restaurantName: string } = req.body;
  if (!restaurantName) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const user: User = res.locals.user;

  if (user.role !== UserType.GUEST) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  if (user.restaurant) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  const newRestaurant = restaurantService.createRestaurant({ restaurantName });

  const savedRestaurant = await restaurantService.saveRestaurant(newRestaurant);

  user.restaurant = savedRestaurant;
  user.role = UserType.OWNER;

  const tokenJWT = generateAuthToken(user);
  user.token = tokenJWT.token;

  const savedUser = await userService.saveUser(user);

  console.log(tokenJWT);

  delete user.token;
  delete user.passwordHashed;
  const responseData = { ...tokenJWT, user };
  res.json(responseData);
}

export async function deleteRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;

  // Check if user exists and has permission
  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  if (user.role !== UserType.OWNER) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  if (!user.restaurant) {
    return next(new ErrorException(ErrorCode.UserNoRestaurant));
  }

  user.restaurant.active = false;
  // Inactivate the restaurant
  await restaurantService.restaurantRepository.save(user.restaurant);
  // Update user's role back to GUEST and remove restaurant reference
  user.role = UserType.GUEST;
  user.restaurant = null;

  const sessionBearer = await prepareUserSessionBearer(user);
  res.json(sessionBearer);
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;

  // Check if user exists
  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  // If user is an owner, delete their restaurant first
  if (user.role === UserType.OWNER && user.restaurant) {
    user.restaurant.active = false;
    await restaurantService.restaurantRepository.save(user.restaurant);
  }
  user.role = UserType.GUEST;
  user.active = false;

  const sessionBearer = await prepareUserSessionBearer(user);

  res.json(sessionBearer);
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, firstName, lastName, email } = req.body;
  const user: User = res.locals.user;

  // Validate email format
  if (email && !isEmailValid(email)) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  // Check if username is already taken by another user
  const existingUser = await userService.getUserByEmailOrUsername(
    username,
    email
  );

  if (existingUser && existingUser.id !== user.id) {
    return next(new ErrorException(ErrorCode.UserAlreadyExists));
  }

  if (username) {
    user.username = username.trim();
  }
  if (firstName) {
    user.firstName = firstName.trim();
  }
  if (lastName) {
    user.lastName = lastName.trim();
  }
  if (email) {
    user.email = email.trim().toLowerCase();
  }

  const sessionBearer = await prepareUserSessionBearer(user);
  res.json(sessionBearer);
}

export async function updatePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { currentPassword, newPassword } = req.body;
  const user: User = res.locals.user;

  if (!currentPassword || !newPassword) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  // Validate password length
  if (!isPasswordValid(newPassword)) {
    return next(new ErrorException(ErrorCode.PasswordWrongFormat));
  }
  console.log(newPassword, 'newPassword');
  const passwordHashed = passwordHash(newPassword);

  user.passwordHashed = passwordHashed;

  const sessionBearer = await prepareUserSessionBearer(user);

  res.json(sessionBearer);
}

export async function updateRestaurantName(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { restaurantDisplayName } = req.body;
  const user: User = res.locals.user;

  user.restaurant.restaurantDisplayName = restaurantDisplayName.trim();
  await restaurantService.saveRestaurant(user.restaurant);

  res.json(user.restaurant);
}
