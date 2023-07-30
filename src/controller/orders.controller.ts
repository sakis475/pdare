import { NextFunction, Request, Response } from "express";
import { ErrorCode } from "../error_handler/error-code";
import { comparePassword } from "../auth/password-hash";
import { generateAuthToken } from "../auth/jwt";
import { UserModel } from "../database/model/user.model";
import { User } from "../database/entity/User";
import { UserType, createOrderRequest } from "../database/interfaces";
import { Order } from "../database/entity/Order";
import { OrderModel } from "../database/model/order.model";
import { ItemModel } from "../database/model/item.model";
import { Item } from "../database/entity/Item";
import { ErrorException } from "../error_handler/error-exception";
import { OrderItem } from "../database/entity/OrderItem";
import { ItemPropertyModel } from "../database/model/itemProperty.model";

export class OrderController {
  orderModel: OrderModel;

  constructor() {
    this.orderModel = new OrderModel();
  }

  /**
   * /order/:orderId
   */
  async getOrder(req: Request, res: Response, next: NextFunction) {
    res.json("okasdas");
  }

  /**
   * /order/active-orders
   */
  async getActiveOrders(req: Request, res: Response, next: NextFunction) {
    res.json("ok");
  }

  /**
   * /order
   */
  async createOrder(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.user;
    const orderItems: createOrderRequest[] = req.body;

    let addOrderItems: OrderItem[] = [];

    for (const orderItem of orderItems) {
      let orderItemToAdd: OrderItem;

      const itemModel = new ItemModel();

      const foundItem = await itemModel.getItemByTitle(orderItem.items.title);
      if (!foundItem) {
        let err = ErrorCode.AssetNotFound;
        err.message = `Item with title: ${orderItem.items.title} not found`;
        return next(new ErrorException(ErrorCode.AssetNotFound));
      }

      orderItemToAdd.item = foundItem;

      const itemPropertyModel = new ItemPropertyModel();
      for (const itemProperty of orderItem.items.itemProperties) {
        const foundItemProperty =
          await itemPropertyModel.getItemPropertyByTitle(itemProperty.title);

        if (!foundItemProperty) {
          let err = ErrorCode.AssetNotFound;
          err.message = `ItemProperty with title: ${itemProperty.title} not found`;
          return next(new ErrorException(ErrorCode.AssetNotFound));
        }

        orderItemToAdd.itemProperties.push(foundItemProperty);
      }
      // orderItems.push(foundItem);
    }

    const partialOrder: Partial<Order> = {
      user,
      orderItems: addOrderItems,
    };

    const newOrder = this.orderModel.orderRepository.create(partialOrder);

    const order = await this.orderModel.saveOrder(newOrder);

    res.json(order);
  }

  /**
   * /order/:orderId
   */
  async updateOrder(req: Request, res: Response, next: NextFunction) {
    res.json("ok");
  }
  /**
   * /order/cancel/:orderId
   */
  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    res.json("ok");
  }
  /**
   * /order/close/:orderId
   */
  async closeOrder(req: Request, res: Response, next: NextFunction) {
    res.json("ok");
  }
}
