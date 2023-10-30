import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Item } from './Item.entity';
import { Order } from './Order.entity';
import { ItemProperty } from './ItemProperty.entity';
import { Restaurant } from './Restaurant.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Order, (order) => order.orderItem)
  order: Order;

  @ManyToOne(() => Item)
  item: Item;

  @ManyToOne(() => ItemProperty)
  itemProperty: ItemProperty;

  @Column({ type: 'integer' })
  quantity: number;
}
