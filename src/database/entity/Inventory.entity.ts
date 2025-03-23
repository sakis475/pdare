import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

  @Column({ default: 0 })
  currentLimitCount?: number;

  @Column({ nullable: true })
  currentLimitStart?: Date;

  @Column({ nullable: true })
  currentLimitEnd?: Date;

  @Index()
  @ManyToOne(() => Restaurant, { nullable: false, eager: true })
  restaurant: Restaurant;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
