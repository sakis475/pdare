import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { OrderItem } from './OrderItem.entity';
import { User } from './User.entity';

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
  orderItem?: OrderItem[];
}
