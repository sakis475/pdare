import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Order } from '../database/entity/Order.entity';
import { OrderOrderItem_ItemPropertyItem } from '../database/entity/OrderItem_ItemProperty.entity';

export class OrderItemPropertyService {
  orderItemPropertyRepository: Repository<OrderOrderItem_ItemPropertyItem>;
  constructor() {
    this.orderItemPropertyRepository = AppDataSource.getRepository(
      OrderOrderItem_ItemPropertyItem
    );
  }

  create(
    orderItemProperty: Partial<OrderOrderItem_ItemPropertyItem>
  ): OrderOrderItem_ItemPropertyItem {
    const newOrderItemProperty =
      this.orderItemPropertyRepository.create(orderItemProperty);

    return newOrderItemProperty;
  }

  async saveOrderItemProperty(
    orderItemProperty: OrderOrderItem_ItemPropertyItem
  ) {
    return await this.orderItemPropertyRepository.save(orderItemProperty);
  }
}
