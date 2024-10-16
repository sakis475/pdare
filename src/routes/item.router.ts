import { NextFunction, Request, Response, Router } from 'express';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';
import {
  createItems,
  getItems,
  updateIsEnabled,
  updateItemOrder,
  updateItems,
} from '../controller/items.controller';

export const itemsRouter = Router();

itemsRouter.get('/', authMiddleware, catchWrapper(getItems));

itemsRouter.post('/updateOrder', authMiddleware, catchWrapper(updateItemOrder));

itemsRouter.post('/createMany', authMiddleware, catchWrapper(createItems));

itemsRouter.patch('/updateMany', authMiddleware, catchWrapper(updateItems));

itemsRouter.delete(
  '/updateIsEnabled',
  authMiddleware,
  catchWrapper(updateIsEnabled)
);
