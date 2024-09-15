import { Repository } from "typeorm";
import { AppDataSource } from "../database/dataSource";
import { Order } from "../database/entity/Order.entity";
import { Restaurant } from "../database/entity/Restaurant.entity";

export class OrderService {
  orderRepository: Repository<Order>;
  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  create(order: Partial<Order>): Order {
    const newOrder = this.orderRepository.create(order);

    return newOrder;
  }

  async getOrderById(id: number, restaurant: Restaurant): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.table", "table")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.item", "items")
      .leftJoinAndSelect("orderItems.itemPropertyOfItem", "itemPropertyOfItem")
      .leftJoinAndSelect("itemPropertyOfItem.itemProperty", "itemProperty")

      .where("order.id = :id", { id })
      .andWhere("user.restaurantId = :restaurantId", {
        restaurantId: restaurant.id,
      })
      .getOne();

    return order;
  }

  async saveOrder(order: Order) {
    return await this.orderRepository.save(order);
  }

  async deleteOrder(order: Order) {
    return await this.orderRepository.remove(order);
  }
}
