import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Category } from './Category';
import { ItemProperty } from './ItemProperty';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;

  @ManyToOne(() => Category)
  category: Category;

  @OneToMany(() => ItemProperty, (itemProperty) => itemProperty.item)
  itemProperty?: ItemProperty[];
}
