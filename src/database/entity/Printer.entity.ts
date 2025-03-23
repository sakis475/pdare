import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrintLocation } from './Category.entity';
import { Restaurant } from './Restaurant.entity';

@Entity()
export class Printer {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text' })
  printerNickname: string;

  @Column({ type: 'text', unique: true })
  printerMac: string;

  @Column({ type: 'text' })
  printerIp: string;

  @Column({ type: 'text' })
  printerPort: string;

  @Column({ type: 'text', nullable: true })
  overrideIP?: string;

  @Column({ type: 'text', nullable: true })
  overridePort?: string;

  @Column({ type: 'text', nullable: true })
  characterSet: string;

  @Column({
    type: 'enum',
    enum: PrintLocation,
    default: PrintLocation.ALL,
  })
  printLocation?: PrintLocation;

  @Column({ default: false })
  analysisPrinter: boolean;

  @Column({ type: 'boolean', default: true })
  active?: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted?: boolean;

  @Index()
  @ManyToOne(() => Restaurant, { eager: true, cascade: true, nullable: true })
  restaurant?: Restaurant;

  @Column({ nullable: true })
  lastDiscovered?: Date;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;
}
