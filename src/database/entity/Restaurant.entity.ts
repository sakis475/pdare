import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './User.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text', unique: true })
  restaurantName: string;

  @Column({ type: 'boolean', default: true })
  active?: string;
}
