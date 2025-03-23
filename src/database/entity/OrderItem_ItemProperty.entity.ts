import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItemProperty } from './ItemProperty.entity';
import { OrderItem } from './OrderItem.entity';

@Entity()
export class OrderOrderItem_ItemPropertyItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @Index()
  @ManyToOne(() => OrderItem, (orderItem) => orderItem.itemPropertyOfItem, {
    onDelete: 'CASCADE',
  })
  orderItem: OrderItem;

  @Index()
  @ManyToOne(() => ItemProperty)
  itemProperty: ItemProperty;
}
