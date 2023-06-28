import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { UserType } from '../interfaces';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  username: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column({
    type: 'text',
    enum: UserType,
    default: UserType.WAITER
  })
  role?: UserType;

  @Column('text')
  passwordHashed: string;
}
