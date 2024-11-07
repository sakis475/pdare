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
  id: number; // Remove optional since it will always exist after save

  @Column({ type: 'text', unique: true })
  restaurantName: string;

  @Column({ type: 'boolean', default: true })
  active: boolean; // Fixed type and removed optional since it has default

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;
}
