import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import {
  cancelInvitationToJoinRestaurant,
  getUsers,
  searchUsers,
  sendInvitationToJoinRestaurant,
  waiterAcceptsInvite,
} from '../controller/user.controller';
import { authMiddleware, authOwnerMiddleware } from '../auth/auth-middleware';

export const userRouter = Router();

//Get all users of restaurant
userRouter.get('/', authMiddleware, catchWrapper(getUsers));

userRouter.get('/search', authMiddleware, catchWrapper(searchUsers));

//admin routes
userRouter.post(
  '/invite',
  authOwnerMiddleware,
  catchWrapper(sendInvitationToJoinRestaurant)
);

userRouter.delete(
  '/invite',
  authOwnerMiddleware,
  catchWrapper(cancelInvitationToJoinRestaurant)
);

//waiter routes
userRouter.post('/invite/accept', catchWrapper(waiterAcceptsInvite));
