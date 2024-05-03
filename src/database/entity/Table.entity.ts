import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
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

  @OneToOne(() => Order, { nullable: true })
  @JoinColumn()
  occupiedByOrder?: Order;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;
}
