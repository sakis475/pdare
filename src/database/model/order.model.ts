import { Repository } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { Order } from '../entity/Order';

export class OrderModel {
  orderRepository: Repository<Order>;
  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
  }

  public async getOrderById(id: number): Promise<Order> {
    const user = await this.orderRepository.findOneBy({
      id
    });

    return user;
  }

  public async saveOrder(order: Order) {
    return await this.orderRepository.save(order);
  }
}
