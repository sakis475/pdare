import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Item } from './Item';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToMany(() => Item)
  @JoinColumn()
  item: Item;
}
