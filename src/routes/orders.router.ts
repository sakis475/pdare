import { Router } from 'express';
import { OrderController } from '../controller/orders.controller';
import { authMiddleware } from '../auth/auth-middleware';
import { catchWrapper } from '../error_handler/error-handler';

/**
 * /order
 */
export const orderRouter = Router();

const orderController = new OrderController();

//Get all active orders
orderRouter.get(
  '/active-orders',
  catchWrapper(orderController.getActiveOrders.bind(orderController))
);

//Get an order
orderRouter.get(
  '/:orderId',
  catchWrapper(orderController.getOrder.bind(orderController))
);

//Create an order
orderRouter.post(
  '/',
  catchWrapper(orderController.createOrder.bind(orderController))
);

//Update an order
orderRouter.patch(
  '/:orderId',
  catchWrapper(orderController.updateOrder.bind(orderController))
);

//Cancel an order
orderRouter.delete(
  '/cancel/:orderId',
  catchWrapper(orderController.cancelOrder.bind(orderController))
);

//Close an order
orderRouter.delete(
  '/close/:orderId',
  catchWrapper(orderController.closeOrder.bind(orderController))
);
