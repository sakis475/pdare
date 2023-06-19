import { Router } from 'express';
import { loginRouter } from './without_auth/login.router';

export const api = Router();

api.use('/login', loginRouter);
// api.use('/register', registerRouter);

// api.use('/order', orderRouter);
// api.use('/scan', scanRouter);
// api.use('/drivers', driversRouter);
// api.use('/clusters', clustersRouter);
