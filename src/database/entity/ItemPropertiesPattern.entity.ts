import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Restaurant } from './Restaurant.entity';
import { Category } from './Category.entity';

@Entity('item_properties_pattern')
export class ItemPropertiesPattern {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  propertyPatternTitle: string;

  @Column({ type: 'jsonb', nullable: true })
  itemProperties: {
    id: number;
    propertyName: string;
    propertyValue: string;
    propertyType: 'multiselect' | 'singleselect';
    orderGroup: number | null;
    orderItem: number | null;
    selected: boolean;
    required?: boolean;
    dependsOn?: number;
  }[];

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  restaurant: Restaurant;

  @Column({ default: 0 })
  propertyPatternOrder?: number;

  @ManyToOne(() => Category, { eager: true, onDelete: 'CASCADE' })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
