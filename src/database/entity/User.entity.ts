import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../interfaces';
import { Restaurant } from './Restaurant.entity';
import { InvitationRequest } from './InvitationRequest.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text', unique: true, nullable: true })
  username?: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  firstName?: string;

  @Column({ type: 'text', nullable: true })
  lastName?: string;

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

  @OneToMany(
    () => InvitationRequest,
    (invitationRequest) => invitationRequest.inviteTo
  )
  invitations?: InvitationRequest[];

  @ManyToOne(() => Restaurant, { eager: true, cascade: true, nullable: true })
  restaurant?: Restaurant;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
