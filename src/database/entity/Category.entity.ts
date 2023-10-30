import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { Restaurant } from './Restaurant.entity';

@Entity()
@Index(['title', 'restaurant'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;
}
