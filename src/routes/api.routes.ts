import { Router } from 'express';
import { loginRouter } from './login.router';
import { registerRouter } from './register.router';
import { tablesRouter } from './tables.router';
import { ordersRouter } from './orders.router';
import {
  adminAuthMiddleware,
  authMiddleware,
  basicAuthMiddleware,
  printerAuthMiddleware,
} from '../auth/auth-middleware';

import { categoryRouter } from './categories.router';
import { adminRouter } from './admin.router';
import { itemsRouter } from './item.router';
import { itemPropertyRouter } from './itemProperty.router';
import { userRouter } from './user.router';
import { itemPropertyPatternRouter } from './itemPropertyPattern.router';
import { healthCheckEmitter } from '../lib/socketio';
import { printerApp } from './printerApp.router';
import { printerRouter } from './printers.router';
import { inventoryRouter } from './inventory.router';

export const api = Router();

//admin
api.use('/admin', adminAuthMiddleware, adminRouter);

api.use('/login', loginRouter);
api.use('/register', registerRouter);

api.use('/user', basicAuthMiddleware, userRouter);

api.use('/categories', authMiddleware, categoryRouter);
api.use('/tables', authMiddleware, tablesRouter);

api.use('/items', authMiddleware, itemsRouter);
api.use('/itemProperties', authMiddleware, itemPropertyRouter);
api.use('/itemPropertyPatterns', authMiddleware, itemPropertyPatternRouter);

api.use('/orders', authMiddleware, ordersRouter);

api.use('/inventory', authMiddleware, inventoryRouter);

api.get('/health-check', basicAuthMiddleware, async (req, res) => {
  try {
    const restaurant = res.locals.user.restaurant;
    await healthCheckEmitter(restaurant);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Health check error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to emit health check' });
  }
});

api.get('/health-check-printer', printerAuthMiddleware, async (req, res) => {
  try {
    const restaurant = res.locals.restaurant;
    await healthCheckEmitter(restaurant);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Health check error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to emit health check' });
  }
});

api.use('/printerApp', printerApp);

api.use('/printers', basicAuthMiddleware, printerRouter);
