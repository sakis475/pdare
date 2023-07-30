import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./Order";

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @Column()
  size: string;

  @OneToOne(() => Order)
  @JoinColumn()
  occupiedBy: Order;
}
