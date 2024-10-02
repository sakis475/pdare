import { Router } from "express";
import { authMiddleware } from "../auth/auth-middleware";
import { catchWrapper } from "../error_handler/error-handler";
import {
  deleteOrder,
  createOrder,
  getOrderById,
  getOrderPrint,
  updateOrder,
} from "../controller/orders.controller";

/**
 * /order
 */
export const ordersRouter = Router();

// //Get all active orders
// ordersRouter.get(
//   '/active-orders',
//   catchWrapper(orderController.getActiveOrders)
// );

//Get an order
ordersRouter.get("/:orderId", catchWrapper(getOrderById));

//Create an order
ordersRouter.post("/", catchWrapper(createOrder));

// //Update an order
ordersRouter.patch("/:orderId", catchWrapper(updateOrder));

// //Cancel an order
// ordersRouter.delete(
//   '/cancel/:orderId',
//   catchWrapper(orderController.cancelOrder)
// );

//Close an order
ordersRouter.delete("/close/:orderId", catchWrapper(deleteOrder));

//Get print image for order
ordersRouter.get("/orderPrint/:orderId", catchWrapper(getOrderPrint));
