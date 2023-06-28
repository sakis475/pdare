import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Category } from './Category';
import { ItemProperties } from './ItemProperties';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;

  @ManyToMany(() => Category)
  @JoinColumn()
  category: Category;

  @ManyToMany(() => ItemProperties)
  @JoinColumn()
  properties: ItemProperties;
}
