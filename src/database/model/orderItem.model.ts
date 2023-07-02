import { Repository } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { OrderItem } from '../entity/OrderItem';

export class OrderItemModel {
  orderItemRepository: Repository<OrderItem>;
  constructor() {
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
  }

  public async getOrderItemById(id: number): Promise<OrderItem> {
    const user = await this.orderItemRepository.findOneBy({
      id
    });

    return user;
  }

  public async saveOrderItem(orderItem: OrderItem) {
    return await this.orderItemRepository.save(orderItem);
  }
}
