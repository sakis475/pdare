import { Router } from 'express';
import {
  createTables,
  disableTables,
  getOnlyActiveTables,
  getTables,
  updateTables,
} from '../controller/tables.controller';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';

export const tablesRouter = Router();

tablesRouter.get('/', authMiddleware, catchWrapper(getTables));
tablesRouter.get('/active', authMiddleware, catchWrapper(getOnlyActiveTables));

tablesRouter.post('/createMany', authMiddleware, catchWrapper(createTables));

tablesRouter.patch('/updateMany', authMiddleware, catchWrapper(updateTables));

tablesRouter.delete(
  '/disableMany',
  authMiddleware,
  catchWrapper(disableTables)
);
