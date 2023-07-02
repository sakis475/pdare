import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Item } from './Item';
import { Order } from './Order';
import { ItemProperty } from './ItemProperty';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Order, (order) => order.OrderItem)
  order: Order;

  @ManyToOne(() => Item)
  item: Item;

  @Column('text', { array: true })
  itemProperties: string[];

  @Column({ type: 'integer' })
  quantity: number;
}
