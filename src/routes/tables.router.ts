import { Router } from 'express';
import { getTables } from '../controller/tables.controller';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';

export const tablesRouter = Router();

tablesRouter.get('/', authMiddleware, catchWrapper(getTables));
