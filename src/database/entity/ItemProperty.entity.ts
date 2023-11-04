import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PropertyDataType } from '../interfaces';
import { Item } from './Item.entity';

@Entity()
export class ItemProperty {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'text'
  })
  propertyName: string;

  @Column({
    type: 'text'
  })
  propertyValue: string;

  @Column({
    type: 'text',
    enum: PropertyDataType
  })
  propertyType: PropertyDataType;

  @ManyToOne(() => Item, (item) => item.itemProperty)
  item: Item;
}
