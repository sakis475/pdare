import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import {
  cancelInvitationToJoinRestaurant,
  createNewRestaurant,
  deleteRestaurant,
  deleteUser,
  getUsers,
  searchUsers,
  sendInvitationToJoinRestaurant,
  updatePassword,
  updateRestaurantName,
  updateUser,
  waiterAcceptsInvite,
} from '../controller/user.controller';
import {
  authMiddleware,
  authOwnerMiddleware,
  basicAuthMiddleware,
} from '../auth/auth-middleware';

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

userRouter.post(
  '/restaurant/create',
  basicAuthMiddleware,
  catchWrapper(createNewRestaurant)
);

userRouter.patch('/', authMiddleware, updateUser);

userRouter.patch('/password', authMiddleware, updatePassword);

userRouter.delete('/delete', authMiddleware, catchWrapper(deleteUser));

userRouter.delete(
  '/restaurant/delete',
  authOwnerMiddleware,
  catchWrapper(deleteRestaurant)
);

userRouter.patch(
  '/restaurant/update',
  authOwnerMiddleware,
  catchWrapper(updateRestaurantName)
);
