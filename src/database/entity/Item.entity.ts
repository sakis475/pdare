import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './Category.entity';
import { ItemProperty } from './ItemProperty.entity';
import { Restaurant } from './Restaurant.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => ItemProperty, (itemProperty) => itemProperty.item, {
    eager: false,
    cascade: true,
  })
  itemProperties?: ItemProperty[];

  @Column({ type: 'float' })
  cost: number;

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @Column({ nullable: true })
  orderItem?: number;

  @ManyToOne(() => Restaurant, { eager: true })
  restaurant: Restaurant;

  @Column({ default: true })
  isEnabled?: boolean;
}
