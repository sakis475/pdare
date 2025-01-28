import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import { authMiddleware, authOwnerMiddleware } from '../auth/auth-middleware';

import {
  createPrinter,
  getAvailablePrinters,
  printersDiscovered,
  requestPrinterScan,
  updatePrinter,
} from '../controller/printer.controller';

export const printerRouter = Router();

printerRouter.get('/', authOwnerMiddleware, catchWrapper(getAvailablePrinters));
printerRouter.post('/', authOwnerMiddleware, catchWrapper(createPrinter));
printerRouter.patch('/', authOwnerMiddleware, catchWrapper(updatePrinter));

printerRouter.post(
  '/requestScan',
  authOwnerMiddleware,
  catchWrapper(requestPrinterScan)
);
