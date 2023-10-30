import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { User } from '../database/entity/User.entity';
import { UserType, createOrderRequest } from '../database/interfaces';
import { Order } from '../database/entity/Order.entity';
import { OrderService } from '../services/order.service';
import { ItemService } from '../services/item.service';
import { Item } from '../database/entity/Item.entity';
import { ErrorException } from '../error_handler/error-exception';
import { OrderItem } from '../database/entity/OrderItem.entity';
import { ItemPropertyService } from '../services/itemProperty.service';

export class OrderController {
  OrderService: OrderService;

  constructor() {
    this.OrderService = new OrderService();
  }

  /**
   * /order/:orderId
   */
  async getOrder(req: Request, res: Response, next: NextFunction) {
    res.json('okasdas');
  }

  /**
   * /order/active-orders
   */
  async getActiveOrders(req: Request, res: Response, next: NextFunction) {
    res.json('ok');
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

      const itemService = new ItemService();

      const foundItem = await itemService.getItemByTitle(orderItem.items.title);
      if (!foundItem) {
        let err = ErrorCode.AssetNotFound;
        err.message = `Item with title: ${orderItem.items.title} not found`;
        return next(new ErrorException(ErrorCode.AssetNotFound));
      }

      orderItemToAdd.item = foundItem;

      const itemPropertyService = new ItemPropertyService();
      for (const itemProperty of orderItem.items.itemProperties) {
        const foundItemProperty =
          await itemPropertyService.getItemPropertyByTitle(itemProperty.title);

        if (!foundItemProperty) {
          let err = ErrorCode.AssetNotFound;
          err.message = `ItemProperty with title: ${itemProperty.title} not found`;
          return next(new ErrorException(ErrorCode.AssetNotFound));
        }

        // orderItemToAdd.itemProperties.push(foundItemProperty);
      }
      // orderItems.push(foundItem);
    }

    const partialOrder: Partial<Order> = {
      user
    };

    const newOrder = this.OrderService.orderRepository.create(partialOrder);

    const order = await this.OrderService.saveOrder(newOrder);

    res.json(order);
  }

  /**
   * /order/:orderId
   */
  async updateOrder(req: Request, res: Response, next: NextFunction) {
    res.json('ok');
  }
  /**
   * /order/cancel/:orderId
   */
  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    res.json('ok');
  }
  /**
   * /order/close/:orderId
   */
  async closeOrder(req: Request, res: Response, next: NextFunction) {
    res.json('ok');
  }
}
