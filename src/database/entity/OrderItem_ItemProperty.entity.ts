import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ItemProperty } from './ItemProperty.entity';
import { OrderItem } from './OrderItem.entity';

@Entity()
export class OrderOrderItem_ItemPropertyItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.itemPropertyOfItem, {
    onDelete: 'CASCADE',
  })
  orderItem: OrderItem;

  @ManyToOne(() => ItemProperty)
  itemProperty: ItemProperty;
}
