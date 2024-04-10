import { Router } from "express";
import { catchWrapper } from "../error_handler/error-handler";
import { createRestaurantAdmin } from "../controller/admin.controller";

export const adminRouter = Router();

adminRouter.post("/createRestaurantAdmin", catchWrapper(createRestaurantAdmin));
