import {
  AfterLoad,
  Column,
  Entity,
  getRepository,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './Order.entity';
import { Restaurant } from './Restaurant.entity';
import { OrderService } from '../../services/order.service';

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  tableName: string;

  @Column({ default: true })
  isEnabled?: Boolean;

  @Column({ nullable: true })
  tableOrder?: number;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;

  @OneToMany(() => Order, (order) => order.table, { eager: false })
  orders?: Order[];

  @OneToOne(() => Order, (Order) => Order.activeTable, { eager: true })
  @JoinColumn()
  occupiedByOrder?: Order;
}
