import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import { connectPrinterApp } from '../controller/user.controller';
import { printerAuthMiddleware } from '../auth/auth-middleware';
import { printersDiscovered } from '../controller/printer.controller';

export const printerApp = Router();

printerApp.post('/connect', catchWrapper(connectPrinterApp));

printerApp.post(
  '/discovered',
  printerAuthMiddleware,
  catchWrapper(printersDiscovered)
);
