import { Router } from 'express';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';
import {
  createCategories,
  deleteCategories,
  getActiveCategories,
  updateCategories
} from '../controller/category.controller';

export const categoryRouter = Router();

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

categoryRouter.patch(
  '/updateMany',
  authMiddleware,
  catchWrapper(updateCategories)
);

categoryRouter.delete(
  '/deleteMany',
  authMiddleware,
  catchWrapper(deleteCategories)
);
