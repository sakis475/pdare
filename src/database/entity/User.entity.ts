import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../interfaces';
import { Restaurant } from './Restaurant.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text', unique: true })
  username: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.GUEST,
  })
  role: UserType;

  @Column({ type: 'text', select: false })
  passwordHashed: string;

  @Column({ type: 'text', nullable: true, select: false })
  token?: string;

  @Column({ type: 'boolean', default: true })
  active?: boolean;

  @Column({ default: 'user', nullable: false })
  displayName?: string;

  @ManyToOne(() => Restaurant, { eager: true, cascade: true, nullable: true })
  restaurant?: Restaurant;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
