import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyDataType } from '../interfaces';
import { Item } from './Item.entity';
import { Restaurant } from './Restaurant.entity';

@Entity()
@Index(['propertyName', 'propertyValue', 'item'], { unique: true })
export class ItemProperty {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'text',
  })
  propertyName: string;

  @Column({
    type: 'text',
  })
  propertyValue: string;

  @Column({
    default: false,
  })
  selected?: boolean;

  @Column({
    default: false,
  })
  required?: boolean;

  @Column({ nullable: true })
  dependsOn?: string;

  @Column({
    type: 'enum',
    enum: PropertyDataType,
    nullable: true,
  })
  propertyType?: PropertyDataType;

  @Column({
    default: true,
  })
  isEnabled: Boolean;

  @Column({ nullable: true })
  orderGroup?: number;

  @Column({ nullable: true })
  orderItem?: number;

  @ManyToOne(() => Item, (item) => item.itemProperties)
  item: Item;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;
}
