import { Router } from 'express';
import { getOrder } from '../../controller/orders.controller';
import { authMiddleware } from '../../auth/auth-middleware';
import { catchWrapper } from '../../error_handler/error-handler';

export const orderRouter = Router();

orderRouter.get('/', catchWrapper(getOrder));
