import { Router } from "express";
import { catchWrapper } from "../error_handler/error-handler";
import { createRestaurantAdmin, testio } from "../controller/admin.controller";

export const adminRouter = Router();

adminRouter.post("/createRestaurantAdmin", catchWrapper(createRestaurantAdmin));

adminRouter.post("/testio", catchWrapper(testio));
