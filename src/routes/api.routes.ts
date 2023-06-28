import { Router } from 'express';
import { loginRouter } from './without_auth/login.router';
import { registerRouter } from './without_auth/register.router';
import { tablesRouter } from './with_auth/tables.router';

export const api = Router();

api.use('/login', loginRouter);
api.use('/register', registerRouter);

api.use('/tables', tablesRouter);
// api.use('/scan', scanRouter);
// api.use('/drivers', driversRouter);
// api.use('/clusters', clustersRouter);
