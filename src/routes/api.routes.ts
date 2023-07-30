import { NextFunction, Router } from "express";
import { loginRouter } from "./without_auth/login.router";
import { registerRouter } from "./without_auth/register.router";
import { tablesRouter } from "./with_auth/tables.router";
import { orderRouter } from "./with_auth/orders.router";
import { testRouter } from "./without_auth/test.router";
import { User } from "../database/entity/User";
import { authMiddleware } from "../auth/auth-middleware";
import { catchWrapper, errorHandler } from "../error_handler/error-handler";
import { ErrorCode } from "../error_handler/error-code";

export const api = Router();

api.use("/login", loginRouter);
api.use("/register", registerRouter);

api.use("/order", authMiddleware, orderRouter);

api.use("/tables", tablesRouter);
api.use("/test", testRouter);

// api.use('/scan', scanRouter);
// api.use('/drivers', driversRouter);
// api.use('/clusters', clustersRouter);
