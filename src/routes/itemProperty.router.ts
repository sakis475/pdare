import { Router } from 'express';
import {
  createTables,
  disableTables,
  getTables,
  updateTables
} from '../controller/tables.controller';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';

// export const itemPropertyRouter = Router();

// itemPropertyRouter.get('/', authMiddleware, catchWrapper(getItemProperties));

// itemPropertyRouter.post('/createMany', authMiddleware, catchWrapper(createItemProperties));

// itemPropertyRouter.patch('/updateMany', authMiddleware, catchWrapper(updateItemProperties));

// itemPropertyRouter.delete(
//   '/disableMany',
//   authMiddleware,
//   catchWrapper(disableItemProperties)
// );
