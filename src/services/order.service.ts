import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Order } from '../database/entity/Order.entity';

export class OrderService {
  orderRepository: Repository<Order>;
  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  async getOrderById(id: number): Promise<Order> {
    const user = await this.orderRepository.findOneBy({
      id
    });

    return user;
  }

  async saveOrder(order: Order) {
    return await this.orderRepository.save(order);
  }
}
