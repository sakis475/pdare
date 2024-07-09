import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderItem } from "./OrderItem.entity";
import { User } from "./User.entity";
import { Table } from "./Table.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => Table, (table) => table.occupiedByOrder, {
    eager: true,
    cascade: true,
  })
  table: Table;

  @CreateDateColumn()
  createdAt?: Date;

  @Column({
    type: "date",
    nullable: true,
  })
  closedAt?: Date;

  @OneToMany(() => OrderItem, (OrderItem) => OrderItem.order, {
    eager: true,
    cascade: true,
  })
  orderItems?: OrderItem[];

  @Column({ default: "" })
  comment?: string;
}
