import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserType } from '../interfaces';
import { Restaurant } from './Restaurant.entity';

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
    enum: UserType
  })
  role: UserType;

  @Column('text')
  passwordHashed: string;

  @Column({ type: 'text', nullable: true })
  token?: string;

  @Column({ type: 'boolean', default: true })
  active?: boolean;

  @ManyToOne(() => Restaurant, { eager: true, cascade: true })
  restaurant: Restaurant;
}
