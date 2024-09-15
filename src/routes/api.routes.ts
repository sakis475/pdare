import { Router } from "express";
import { loginRouter } from "./login.router";
import { registerRouter } from "./register.router";
import { tablesRouter } from "./tables.router";
import { ordersRouter } from "./orders.router";
import { testRouter } from "./test.router";
import {
  adminAuthMiddleware,
  authMiddleware,
  basicAuthMiddleware,
} from "../auth/auth-middleware";

import { categoryRouter } from "./categories.router";
import { adminRouter } from "./admin.router";
import { itemsRouter } from "./item.router";
import { itemPropertyRouter } from "./itemProperty.router";
import { userRouter } from "./user.router";
import { Server } from "socket.io";

export const api = Router();

//admin
api.use("/admin", adminAuthMiddleware, adminRouter);

api.use("/login", loginRouter);
api.use("/register", registerRouter);

api.use("/user", basicAuthMiddleware, userRouter);

api.use("/categories", authMiddleware, categoryRouter);
api.use("/tables", authMiddleware, tablesRouter);

api.use("/items", authMiddleware, itemsRouter);
api.use("/itemProperties", authMiddleware, itemPropertyRouter);

api.use("/orders", authMiddleware, ordersRouter);

api.use("/test", testRouter);
