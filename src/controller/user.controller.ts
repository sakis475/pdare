import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword, passwordHash } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';
import { UserType } from '../database/interfaces';
import { User } from '../database/entity/User.entity';
import { InvitationRequestService } from '../services/invitationRequest.service';
import { InvitationRequestStatus } from '../database/entity/InvitationRequest.entity';

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

  const userService = new UserService();

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

  const userService = new UserService();
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

  const userService = new UserService();

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

  const userService = new UserService();

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

  const userService = new UserService();

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
