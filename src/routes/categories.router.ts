import { Router } from 'express';
import { getTables } from '../controller/tables.controller';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';
import { createCategory } from '../controller/category.controller';

export const categoryRouter = Router();

categoryRouter.post('/', authMiddleware, catchWrapper(createCategory));
