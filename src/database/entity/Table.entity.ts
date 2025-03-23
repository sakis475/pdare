import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './Order.entity';
import { Restaurant } from './Restaurant.entity';

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

  @Index()
  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;

  @Index()
  @OneToMany(() => Order, (order) => order.table, { eager: false })
  orders?: Order[];

  @Index()
  @OneToOne(() => Order, (Order) => Order.activeTable, { eager: true })
  @JoinColumn()
  occupiedByOrder?: Order;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
