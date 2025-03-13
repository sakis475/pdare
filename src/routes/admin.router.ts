import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import {
  createRestaurantAdmin,
  getActiveSocketConnections,
  printerTest,
  sendTestEmail,
  testio,
} from '../controller/admin.controller';

export const adminRouter = Router();

adminRouter.post('/createRestaurantAdmin', catchWrapper(createRestaurantAdmin));

adminRouter.post('/testio', catchWrapper(testio));

adminRouter.post('/printer-test-order', catchWrapper(printerTest));

adminRouter.get(
  '/socket-active-connections',
  catchWrapper(getActiveSocketConnections)
);

adminRouter.post('/sendTestEmail', catchWrapper(sendTestEmail));
