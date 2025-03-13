import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import {
  cancelInvitationToJoinRestaurant,
  connectPrinterApp,
  createNewRestaurant,
  createOTP,
  deleteRestaurant,
  deleteUser,
  existsOTP,
  getInvitation,
  getUsers,
  leaveRestaurant,
  searchUser,
  sendInvitationToJoinRestaurant,
  updatePassword,
  updateRestaurant,
  updateUser,
  updateUserFromAdmin,
  verifyOTP,
  waiterResponseInvite,
} from '../controller/user.controller';
import {
  authMiddleware,
  authOwnerMiddleware,
  basicAuthMiddleware,
} from '../auth/auth-middleware';

export const userRouter = Router();

//Get all users of restaurant
userRouter.get('/', authMiddleware, catchWrapper(getUsers));

userRouter.get('/search', authMiddleware, catchWrapper(searchUser));

//routes
userRouter.get('/invite', basicAuthMiddleware, catchWrapper(getInvitation));

userRouter.post('/existsOTP', basicAuthMiddleware, catchWrapper(existsOTP));

userRouter.post('/createOTP', basicAuthMiddleware, catchWrapper(createOTP));

userRouter.post('/verifyOTP', basicAuthMiddleware, catchWrapper(verifyOTP));

//admin routes
userRouter.post(
  '/invite',
  authOwnerMiddleware,
  catchWrapper(sendInvitationToJoinRestaurant)
);

userRouter.delete(
  '/invite/:invitationId',
  authOwnerMiddleware,
  catchWrapper(cancelInvitationToJoinRestaurant)
);

//waiter routes
userRouter.post(
  '/invite/response/:invitationId',
  catchWrapper(waiterResponseInvite)
);

userRouter.post(
  '/restaurant/create',
  basicAuthMiddleware,
  catchWrapper(createNewRestaurant)
);

userRouter.patch('/', authMiddleware, catchWrapper(updateUser));

userRouter.patch('/admin', authMiddleware, catchWrapper(updateUserFromAdmin));

userRouter.patch('/password', authMiddleware, catchWrapper(updatePassword));

userRouter.delete('/delete', authMiddleware, catchWrapper(deleteUser));

userRouter.delete(
  '/restaurant/leaveRestaurant',
  authMiddleware,
  catchWrapper(leaveRestaurant)
);

userRouter.delete(
  '/restaurant/delete',
  authOwnerMiddleware,
  catchWrapper(deleteRestaurant)
);

userRouter.patch(
  '/restaurant/update',
  authOwnerMiddleware,
  catchWrapper(updateRestaurant)
);
