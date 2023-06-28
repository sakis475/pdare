import { Router } from 'express';
import { getTables } from '../../controller/tables.controller';
import { authMiddleware } from '../../auth/auth-middleware';

export const tablesRouter = Router();

tablesRouter.get('/', authMiddleware, getTables);
