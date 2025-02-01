import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword, passwordHash } from '../auth/password-hash';
import {
  generateAuthToken,
  generatePrinterAppToken,
  prepareUserSessionBearer,
} from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';
import { UserType } from '../database/interfaces';
import { User } from '../database/entity/User.entity';
import { InvitationRequestService } from '../services/invitationRequest.service';
import { InvitationRequestStatus } from '../database/entity/InvitationRequest.entity';
import { RestaurantService } from '../services/restaurant.service';
import { isEmailValid, isPasswordValid } from '../lib/helpers/formUtils';
import { usersUpdatedEmitter } from '../lib/socketio';
import _ from 'lodash';

const restaurantService = new RestaurantService();
const userService = new UserService();
const invitationRequestService = new InvitationRequestService();

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

  const activeInvitations = await invitationRequestService.getAllRequests(
    user.restaurant,
    InvitationRequestStatus.AWAITING
  );

  res.json({ users: allNoOwnerUsers, activeInvitations });
}

export async function searchUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  const searchKeyword: string = req.query.email as string;

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

  if (!searchKeyword.includes('@') || !searchKeyword.split('@')?.[0]?.length) {
    return res.json([]);
  }

  const userSearched = await userService.getUserByEmail(searchKeyword);

  if (userSearched?.restaurant?.id === user?.restaurant?.id) {
    return null;
  }

  res.json(userSearched);
}

export async function getInvitation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;

  const userWithInvitations = await userService.getUserByEmail(user.email);

  userWithInvitations.invitations = userWithInvitations?.invitations?.filter(
    (e) => e.invitationStatus === InvitationRequestStatus.AWAITING
  );
  res.json(userWithInvitations);
}

export async function sendInvitationToJoinRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const ownerUser: User = res.locals.user;

  if (ownerUser.role !== UserType.OWNER) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  const user = await userService.getUserByEmail(email);

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
  res.json(newInvitation);
}

export async function cancelInvitationToJoinRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { invitationId } = req.params;

  if (!invitationId) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const ownerUser: User = res.locals.user;

  if (ownerUser.role !== UserType.OWNER) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  const invitationRequestService = new InvitationRequestService();

  const invitedUserInvitation = await invitationRequestService.getRequestById(
    +invitationId
  );

  if (!invitedUserInvitation) {
    return next(new ErrorException(ErrorCode.RequestNotFound));
  }

  if (invitedUserInvitation.restaurant.id !== ownerUser.restaurant.id) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  await invitationRequestService.updateRequest(invitedUserInvitation.id, {
    invitationStatus: InvitationRequestStatus.CANCELLED,
  });

  res.json();
}

export async function waiterResponseInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { invitationId } = req.params;
  const { response } = req.body;

  if (!invitationId) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const user: User = res.locals.user;
  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  const invitation = await invitationRequestService.getRequestById(
    +invitationId
  );

  if (
    !invitation ||
    invitation.invitationStatus !== InvitationRequestStatus.AWAITING
  ) {
    return next(new ErrorException(ErrorCode.AssetNotFound));
  }
  let sessionBearer;
  if (response === true) {
    invitation.invitationStatus = InvitationRequestStatus.ACCEPTED;
    await invitationRequestService.saveRequest(invitation);
    user.restaurant = invitation.restaurant;
    user.displayName = 'user';
    user.role = UserType.WAITER;

    sessionBearer = await prepareUserSessionBearer(user);
  } else if (response === false) {
    invitation.invitationStatus = InvitationRequestStatus.DENIED;
    await invitationRequestService.saveRequest(invitation);
  }

  res.json(sessionBearer);
  usersUpdatedEmitter(invitation.restaurant);
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
  const restaurant = _.cloneDeep(user.restaurant);
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

  usersUpdatedEmitter(restaurant);
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  const restaurant = _.cloneDeep(user.restaurant);

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
  user.restaurant = null;

  const sessionBearer = await prepareUserSessionBearer(user);
  res.json(sessionBearer);

  usersUpdatedEmitter(restaurant);
}

export async function leaveRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  const restaurant = _.cloneDeep(user.restaurant);
  // Check if user exists
  if (!user) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  user.role = UserType.GUEST;
  user.restaurant = null;

  const sessionBearer = await prepareUserSessionBearer(user);

  console.log(sessionBearer, 'sessionBearer');

  res.json(sessionBearer);
  usersUpdatedEmitter(restaurant);
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { firstName, lastName, email, displayName } = req.body;
  const user: User = res.locals.user;

  // Validate email format
  if (email && !isEmailValid(email)) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  // Check if username is already taken by another user
  const existingUser = await userService.getUserByEmail(email);

  if (existingUser && existingUser.id !== user.id) {
    return next(new ErrorException(ErrorCode.UserAlreadyExists));
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

  if (displayName && existingUser.role === UserType.OWNER) {
    user.displayName = displayName.trim();
  }

  const sessionBearer = await prepareUserSessionBearer(user);
  res.json(sessionBearer);
  usersUpdatedEmitter(user.restaurant);
}

export async function updateUserFromAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, displayName, markForDelete } = req.body;
  const user: User = res.locals.user;
  const restaurant = _.cloneDeep(user.restaurant);

  if (user.role !== UserType.OWNER) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  // Check if username is already taken by another user
  const existingUser = await userService.getUserByEmail(email);

  if (!existingUser) {
    return next(new ErrorException(ErrorCode.NoUserFoundError));
  }

  if (existingUser.restaurant.id !== existingUser.restaurant.id) {
    return next(new ErrorException(ErrorCode.NoPermission));
  }

  if (displayName) {
    existingUser.displayName = displayName.trim();
  }

  if (markForDelete === true) {
    existingUser.displayName = 'user';
    existingUser.role = UserType.GUEST;
    existingUser.token = null;
    existingUser.restaurant = null;
  }

  await userService.saveUser(existingUser);
  const allNoOwnerUsers = await userService.getUsersByRestaurant(
    user.restaurant,
    true
  );
  res.json(allNoOwnerUsers);
  usersUpdatedEmitter(user.restaurant);
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

  usersUpdatedEmitter(user.restaurant);
}

export async function updateRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    restaurantDisplayName,
    currencySymbol,
    couvertCost,
    restaurantLanguage,
  } = req.body;

  const user: User = res.locals.user;

  if (restaurantDisplayName) {
    user.restaurant.restaurantDisplayName = restaurantDisplayName.trim();
  }

  if (currencySymbol) {
    user.restaurant.currencySymbol = currencySymbol.trim();
  }

  if (couvertCost && couvertCost >= 0) {
    const parsedCost = Number(couvertCost);
    if (!isNaN(parsedCost) && parsedCost >= 0) {
      user.restaurant.couvertCost = parsedCost;
    }
  }

  if (restaurantLanguage) {
    user.restaurant.restaurantLanguage = restaurantLanguage.trim();
  }
  await restaurantService.saveRestaurant(user.restaurant);

  const sessionBearer = await prepareUserSessionBearer(user);

  res.json(sessionBearer);
}

export async function connectPrinterApp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;

  console.log(email, password);

  if (!email || !password) {
    return next(
      new ErrorException(new ErrorException(ErrorCode.NoNameOrPassword))
    );
  }
  const userService = new UserService();

  const user = await userService.getUserByEmailOrUsername(null, email, true);

  if (!user || !user.active) {
    return next(new ErrorException(ErrorCode.NoUserOrDisabledError));
  }

  if (!comparePassword(password, user.passwordHashed)) {
    return next(new ErrorException(ErrorCode.WrongPasswordError));
  }

  const restaurant = user.restaurant;

  const connectionCode = generatePrinterAppToken(user);

  restaurant.printerAppConnectionCode = connectionCode;
  await restaurantService.saveRestaurant(restaurant);

  delete user.passwordHashed;

  res.json({ connectionCode, user });
}
