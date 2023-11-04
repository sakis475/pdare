import { Router } from 'express';
import { getTables } from '../controller/tables.controller';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';
import {
  createCategories,
  createCategory,
  deleteCategories,
  getActiveCategories
} from '../controller/category.controller';

export const categoryRouter = Router();

categoryRouter.post('/create', authMiddleware, catchWrapper(createCategory));

categoryRouter.post(
  '/createMany',
  authMiddleware,
  catchWrapper(createCategories)
);
categoryRouter.get(
  '/active',
  authMiddleware,
  catchWrapper(getActiveCategories)
);

categoryRouter.delete(
  '/deleteMany',
  authMiddleware,
  catchWrapper(deleteCategories)
);
