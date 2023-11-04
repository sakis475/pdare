import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './Item.entity';
import { Order } from './Order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Order, (order) => order.orderItem)
  order: Order;

  @ManyToOne(() => Item)
  item: Item;

  @Column({ type: 'integer' })
  quantity: number;
}
