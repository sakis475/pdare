import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from './Item.entity';
import { Order } from './Order.entity';
import { OrderOrderItem_ItemPropertyItem } from './OrderItem_ItemProperty.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  order: Order;

  @ManyToOne(() => Item, { onDelete: 'CASCADE', eager: true, nullable: false })
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

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @Column({ default: false })
  orderItemReady?: boolean;

  @Column({ default: '' })
  comment?: string;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
