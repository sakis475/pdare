import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Restaurant } from './Restaurant.entity';

export enum InvitationRequestStatus {
  ACCEPTED = 'accepted',
  DENIED = 'denied',
  CANCELLED = 'cancelled',
  AWAITING = 'awaiting',
}

@Entity()
export class InvitationRequest {
  @PrimaryGeneratedColumn()
  id?: number;

  @Index()
  @ManyToOne(() => User, { eager: true })
  inviteFrom: User;

  @Index()
  @ManyToOne(() => User, { eager: true })
  inviteTo: User;

  @Column({
    type: 'enum',
    enum: InvitationRequestStatus,
    default: InvitationRequestStatus.AWAITING,
  })
  invitationStatus?: InvitationRequestStatus;

  @Index()
  @ManyToOne(() => Restaurant, { eager: true })
  restaurant: Restaurant;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
