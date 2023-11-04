import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Restaurant } from './Restaurant.entity';

@Entity()
@Index(['title', 'restaurant'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;

  @ManyToOne(() => Restaurant, { nullable: false })
  restaurant: Restaurant;
}
