import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Order } from '../database/entity/Order.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';

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
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.item', 'items')
      .leftJoinAndSelect('orderItems.itemPropertyOfItem', 'itemPropertyOfItem')
      .leftJoinAndSelect('itemPropertyOfItem.itemProperty', 'itemProperty')

      .where('order.id = :id', { id })
      .andWhere('user.restaurantId = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .getOne();

    return order;
  }

  async getOrders(
    restaurant: Restaurant,
    fromDate?: Date,
    toDate?: Date,
    isClosed?: boolean,
    pageNumber: number = 0,
    rowNumber: number = 15
  ): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.item', 'items')
      .leftJoinAndSelect('orderItems.itemPropertyOfItem', 'itemPropertyOfItem')
      .leftJoinAndSelect('itemPropertyOfItem.itemProperty', 'itemProperty')
      .where('user.restaurantId = :restaurantId', {
        restaurantId: restaurant.id,
      });
    if (fromDate) {
      query.andWhere('order.createdAt >= :fromDate', {
        fromDate: fromDate.toString(),
      });
    }
    // If `toDate` is provided, add it to the query
    if (toDate) {
      query.andWhere('order.createdAt <= :toDate', {
        toDate: toDate.toString(),
      });
    }

    // If `isClosed` is specified, add the appropriate condition
    if (typeof isClosed === 'boolean') {
      if (isClosed) {
        query.andWhere('order.closedAt IS NOT NULL');
      } else {
        query.andWhere('order.closedAt IS NULL');
      }
    }

    // Pagination logic
    const skip = pageNumber * rowNumber;
    query.skip(skip).take(rowNumber);
    query.orderBy('order.createdAt', 'DESC');
    // Execute the query and return results
    const orders = await query.getMany();

    return orders;
  }

  async saveOrder(order: Order) {
    return await this.orderRepository.save(order);
  }

  async deleteOrder(order: Order) {
    return await this.orderRepository.remove(order);
  }
}
