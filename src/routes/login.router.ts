import { Router } from "express";
import { postLogin, postRefreshSession } from "../controller/login.controller";
import { catchWrapper } from "../error_handler/error-handler";

export const loginRouter = Router();

loginRouter.post("/", catchWrapper(postLogin));
loginRouter.post("/session", catchWrapper(postRefreshSession));
