import { Router } from 'express';
import { postOrder } from '../../controller/orders.controller';
import { authMiddleware } from '../../auth/auth-middleware';

export const tablesRouter = Router();

tablesRouter.get('/', authMiddleware, postOrder);
