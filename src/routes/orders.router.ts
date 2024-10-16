import { Router } from 'express';
import { catchWrapper } from '../error_handler/error-handler';
import {
  deleteOrder,
  createOrder,
  getOrderById,
  getOrderPrint,
  updateOrder,
  closeOrder,
  getOrders,
} from '../controller/orders.controller';

/**
 * /order
 */
export const ordersRouter = Router();

// //Get all active orders
// ordersRouter.get(
//   '/active-orders',
//   catchWrapper(orderController.getActiveOrders)
// );

//Get orders
ordersRouter.get('/', catchWrapper(getOrders));

//Get an order
ordersRouter.get('/:orderId', catchWrapper(getOrderById));

//Create an order
ordersRouter.post('/', catchWrapper(createOrder));

//Update an order
ordersRouter.patch('/:orderId', catchWrapper(updateOrder));

// //Cancel an order
// ordersRouter.delete(
//   '/cancel/:orderId',
//   catchWrapper(orderController.cancelOrder)
// );

//Close an order
ordersRouter.patch('/close/:orderId', catchWrapper(closeOrder));

//Get print image for order
ordersRouter.get('/orderPrint/:orderId', catchWrapper(getOrderPrint));
