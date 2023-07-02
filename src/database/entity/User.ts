import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { UserType } from '../interfaces';
import { Order } from './Order';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text', unique: true })
  username: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.WAITER
  })
  role?: UserType;

  @Column('text')
  passwordHashed: string;
}
