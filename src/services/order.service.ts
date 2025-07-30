import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Order } from '../database/entity/Order.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { TableService } from './table.service';

export class OrderService {
  orderRepository: Repository<Order>;
  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  create(order: Partial<Order>): Order {
    const newOrder = this.orderRepository.create(order);

    return newOrder;
  }

  async getOrderById(
    id: number,
    restaurant: Restaurant,
    getTimestamps = false,
    getOnlyActiveOrderItems = false
  ): Promise<Order> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.item', 'items')
      .leftJoinAndSelect('orderItems.itemPropertyOfItem', 'itemPropertyOfItem')
      .leftJoinAndSelect('items.category', 'category')
      .leftJoinAndSelect('itemPropertyOfItem.itemProperty', 'itemProperty')
      .where('order.id = :id', { id })
      .andWhere('user.restaurantId = :restaurantId', {
        restaurantId: restaurant.id,
      });

    if (getOnlyActiveOrderItems) {
      query.andWhere('orderItems.removedAt IS NULL');
    }

    if (getTimestamps) {
      query.addSelect('orderItems.createdAt').addSelect('orderItems.updatedAt');
    }

    const order = await query.getOne();
    return order;
  }

  async markOrderAsReady(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.orderReady = true;
    order.orderItems?.forEach((item) => {
      item.orderItemReady = true;
    });

    return await this.orderRepository.save(order);
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
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('table.restaurant', 'restaurant')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.item', 'items')
      .leftJoinAndSelect('orderItems.itemPropertyOfItem', 'itemPropertyOfItem')
      .leftJoinAndSelect('itemPropertyOfItem.itemProperty', 'itemProperty')
      .where('restaurant.id = :restaurantid', {
        restaurantid: restaurant.id,
      });
    if (fromDate) {
      query.andWhere('order.createdAt >= :fromDate', {
        fromDate: fromDate,
      });
    }
    // // If `toDate` is provided, add it to the query
    // if (toDate) {
    //   query.andWhere('order.createdAt <= :toDate', {
    //     toDate: toDate.toString(),
    //   });
    // }

    // If `isClosed` is specified, add the appropriate condition
    // if (typeof isClosed === 'boolean') {
    //   if (isClosed) {
    //     query.andWhere('order.closedAt IS NOT NULL');
    //   } else {
    //     query.andWhere('order.closedAt IS NULL');
    //   }
    // }

    // Pagination logic
    const skip = pageNumber * rowNumber;
    query.skip(skip).take(rowNumber);
    query.addOrderBy('order.createdAt', 'DESC');
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

  calculateFinal(order: Order, restaurant: Restaurant) {
    // Use a helper function to ensure precision
    const round = (num: number): number => {
      return Math.round(num * 100) / 100;
    };

    // Calculate total cost including VAT
    let finalCost = 0;
    order.orderItems.forEach((orderItem) => {
      if (!orderItem.removedAt) {
        // Round each line item calculation
        const lineTotal = round(orderItem.item.cost * orderItem.quantity);
        finalCost += lineTotal;
      }
    });

    // Add couvert cost
    const couvertCost = round(order.couvert * restaurant.couvertCost);
    finalCost = round(finalCost + couvertCost);

    return {
      total: finalCost,
    };
  }

  async autoCloseOrders() {
    const ordersToClose = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.restaurant', 'restaurant')
      .where('order.closedAt IS NULL')
      .andWhere(
        `order.createdAt < (NOW() - INTERVAL '1 hour' * restaurant.autoCloseOrderDelayHours)`
      )
      .getMany();

    if (!ordersToClose.length) return 0;

    // Update closedAt for orders
    await this.orderRepository
      .createQueryBuilder()
      .update(Order)
      .set({ closedAt: new Date() })
      .whereInIds(ordersToClose.map((o) => o.id))
      .execute();

    // Clear occupiedByOrder for tables
    const tableIds = ordersToClose.map((o) => o.table.id);
    if (tableIds.length) {
      const tableService = new TableService();
      await tableService.tableRepository
        .createQueryBuilder()
        .update()
        .set({ occupiedByOrder: null })
        .whereInIds(tableIds)
        .execute();
    }
    return ordersToClose.length;
  }
}
