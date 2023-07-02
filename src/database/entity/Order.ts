import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { OrderItem } from './OrderItem';
import { User } from './User';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt?: Date;

  @Column({
    type: 'date',
    nullable: true
  })
  closedAt?: Date;

  @OneToMany(() => OrderItem, (OrderItem) => OrderItem.order, {
    eager: true
  })
  OrderItem?: OrderItem[];
}
