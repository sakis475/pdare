import { Router } from "express";
import { catchWrapper } from "../error_handler/error-handler";
import {
  cancelInvitationToJoinRestaurant,
  sendInvitationToJoinRestaurant,
  waiterAcceptsInvite,
} from "../controller/user.controller";
import { authOwnerMiddleware } from "../auth/auth-middleware";

export const userRouter = Router();

//admin routes
userRouter.post(
  "/invite",
  authOwnerMiddleware,
  catchWrapper(sendInvitationToJoinRestaurant)
);

userRouter.delete(
  "/invite",
  authOwnerMiddleware,
  catchWrapper(cancelInvitationToJoinRestaurant)
);

//waiter routes
userRouter.post("/invite/accept", catchWrapper(waiterAcceptsInvite));
