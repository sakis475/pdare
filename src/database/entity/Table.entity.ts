import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Order } from './Order.entity';
import { Restaurant } from './Restaurant.entity';

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  tableName: string;

  @Column()
  status: string;

  @OneToOne(() => Order, { nullable: true, cascade: true })
  @JoinColumn()
  occupiedByOrder?: Order;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;
}
