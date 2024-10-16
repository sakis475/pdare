import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { OrderItem } from '../database/entity/OrderItem.entity';

export class OrderItemService {
  orderItemRepository: Repository<OrderItem>;
  constructor() {
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
  }

  public async getOrderItemById(id: number): Promise<OrderItem> {
    const user = await this.orderItemRepository.findOneBy({
      id,
    });

    return user;
  }

  public async saveOrderItem(orderItem: OrderItem) {
    return await this.orderItemRepository.save(orderItem);
  }

  public async deleteOrderItems(orderItems: OrderItem[]) {
    console.log(orderItems, 'orderItems delete');
    await this.orderItemRepository.remove(orderItems);
  }
}
