import { Router } from "express";
import { catchWrapper } from "../error_handler/error-handler";
import { createRestaurantAdmin } from "../controller/admin.controller";
import { adminAuthMiddleware } from "../auth/auth-middleware";

export const adminRouter = Router();

adminRouter.post(
  "/createRestaurantAdmin",
  adminAuthMiddleware,
  catchWrapper(createRestaurantAdmin)
);
