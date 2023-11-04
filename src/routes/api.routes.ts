import { Router } from 'express';
import { loginRouter } from './login.router';
import { registerRouter } from './register.router';
import { tablesRouter } from './tables.router';
import { orderRouter } from './orders.router';
import { testRouter } from './test.router';
import { authMiddleware } from '../auth/auth-middleware';

import { categoryRouter } from './categories.router';
import { adminRouter } from './admin.router';

export const api = Router();

//admin
api.use('/admin', adminRouter);

//restaurant users
api.use('/login', loginRouter);
api.use('/register', authMiddleware, registerRouter);

api.use('/categories', authMiddleware, categoryRouter);

api.use('/order', authMiddleware, orderRouter);

api.use('/tables', authMiddleware, tablesRouter);

api.use('/test', testRouter);
