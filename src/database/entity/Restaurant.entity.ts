import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id?: number; // Remove optional since it will always exist after save

  @Column({ type: 'text', unique: true })
  restaurantName: string;

  @Column({ type: 'text', nullable: true })
  restaurantDisplayName?: string;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    default: 0,
    nullable: false,
  })
  couvertCost?: number;

  @Column({ default: '€' })
  currencySymbol?: string;

  @Column({ type: 'boolean', default: true })
  active?: boolean; // Fixed type and removed optional since it has default

  @Column({ default: false })
  isPrinterAppInstalled?: boolean;

  @Column({ nullable: true, select: false })
  printerAppConnectionCode?: string;

  @Column({ type: 'text', nullable: true })
  restaurantLanguage?: string;

  @Column({ default: 20, nullable: true })
  orderDailyLimit?: number;

  @CreateDateColumn({ select: false })
  createdAt?: Date;

  @UpdateDateColumn({ select: false })
  updatedAt?: Date;

  @Column({ default: null, nullable: true })
  printersConnectionMethod?: PrintersConnectionMethod;
}

export type PrintersConnectionMethod = 'DesktopApp' | 'SmartphoneClient';
