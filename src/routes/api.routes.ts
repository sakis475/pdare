import { Router } from 'express';
import { loginRouter } from './login.router';
import { registerRouter } from './register.router';
import { tablesRouter } from './tables.router';
import { orderRouter } from './orders.router';
import { testRouter } from './test.router';
import { authMiddleware } from '../auth/auth-middleware';

import { categoryRouter } from './categories.router';

export const api = Router();

api.use('/login', loginRouter);
api.use('/register', authMiddleware, registerRouter);

api.use('/order', authMiddleware, orderRouter);

api.use('/tables', authMiddleware, tablesRouter);
api.use('/categories', authMiddleware, categoryRouter);
api.use('/test', testRouter);
