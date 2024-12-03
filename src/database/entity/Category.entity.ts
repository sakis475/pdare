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

export enum PrintLocation {
  KITCHEN = 'kitchen',
  BAR = 'bar',
  ALL = 'all',
}

@Entity()
@Index(['title', 'restaurant'])
export class Category {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;

  @Column({ nullable: true })
  orderCategory?: number;

  @Column({
    type: 'enum',
    enum: PrintLocation,
    default: PrintLocation.ALL,
  })
  printLocation?: PrintLocation;

  @Column({ nullable: true })
  color?: string;

  @Column({ default: true })
  isEnabled?: boolean;

  @ManyToOne(() => Restaurant, { nullable: false })
  restaurant: Restaurant;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
