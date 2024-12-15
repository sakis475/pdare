import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Restaurant } from './Restaurant.entity';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: 0 })
  orderCount: number;

  @ManyToOne(() => Restaurant, { nullable: false })
  restaurant: Restaurant;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
