import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ItemProperty } from './ItemProperty.entity';
import { OrderItem } from './OrderItem.entity';

@Entity()
export class OrderOrderItem_ItemPropertyItem {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => OrderItem)
  orderItem: OrderItem;

  @ManyToOne(() => ItemProperty)
  itemProperty: ItemProperty;

  @Column({ type: 'integer' })
  quantity: number;
}
