import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./Order.entity";
import { Restaurant } from "./Restaurant.entity";

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

  @OneToOne(() => Order, (order) => order.table, { nullable: true })
  occupiedByOrder?: Order;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;
}
