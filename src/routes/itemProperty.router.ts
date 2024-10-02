import { Router } from "express";

import { authMiddleware } from "../auth/auth-middleware";
import { catchWrapper } from "../error_handler/error-handler";
import { suggestItemProperties } from "../controller/itemProperties.controller";

export const itemPropertyRouter = Router();

itemPropertyRouter.get(
  "/suggestItemProperties",
  authMiddleware,
  catchWrapper(suggestItemProperties)
);

// itemPropertyRouter.post('/createMany', authMiddleware, catchWrapper(createItemProperties));

// itemPropertyRouter.patch('/updateMany', authMiddleware, catchWrapper(updateItemProperties));

// itemPropertyRouter.delete(
//   '/disableMany',
//   authMiddleware,
//   catchWrapper(disableItemProperties)
// );
