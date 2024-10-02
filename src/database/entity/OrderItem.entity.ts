import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './Item.entity';
import { Order } from './Order.entity';
import { OrderOrderItem_ItemPropertyItem } from './OrderItem_ItemProperty.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Item, { onDelete: 'CASCADE', eager: true })
  item: Item;

  @OneToMany(
    () => OrderOrderItem_ItemPropertyItem,
    (itemPropertyOfItem) => itemPropertyOfItem.orderItem,
    {
      eager: true,
      cascade: true,
    }
  )
  itemPropertyOfItem?: OrderOrderItem_ItemPropertyItem[];

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ default: '' })
  comment?: string;

  @CreateDateColumn()
  createdAt?: Date;
}
