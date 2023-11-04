import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Category } from './Category.entity';
import { ItemProperty } from './ItemProperty.entity';
import { OrderItem } from './OrderItem.entity';
import { Restaurant } from './Restaurant.entity';

@Entity()
@Index(['title', 'restaurant'], { unique: true })
export class Item {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text' })
  title: string;

  @OneToMany(() => ItemProperty, (itemProperty) => itemProperty.item, {
    eager: true
  })
  itemProperty?: ItemProperty[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.item, {
    eager: true
  })
  orderItem?: OrderItem[];

  @Column({ type: 'float' })
  cost: number;

  @ManyToOne(() => Category)
  category: Category;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;
}
