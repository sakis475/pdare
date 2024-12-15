import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './OrderItem.entity';
import { User } from './User.entity';
import { Table } from './Table.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true })
  uniqueId?: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Table, {
    eager: false,
    cascade: true,
    nullable: false,
  })
  table: Table;

  @CreateDateColumn()
  createdAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  closedAt?: Date;

  @OneToMany(() => OrderItem, (OrderItem) => OrderItem.order, {
    eager: true,
    cascade: true,
  })
  orderItems?: OrderItem[];

  @OneToOne(() => Table, (Table) => Table.occupiedByOrder, { cascade: true })
  activeTable?: Table;

  @Column({
    nullable: true,
  })
  couvert?: number;

  @Column({ default: false })
  orderReady?: boolean;

  @Column({
    type: 'float',
    nullable: true,
  })
  finalCost?: number;

  @Column({ default: '' })
  comment?: string;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
