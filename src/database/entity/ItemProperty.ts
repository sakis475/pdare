import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Item } from './Item';
import { PropertyDataType } from '../interfaces';

@Entity()
export class ItemProperty {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;

  @Column({
    type: 'text',
    enum: PropertyDataType,
    default: PropertyDataType.SINGLESELECT
  })
  dataType: PropertyDataType;

  @ManyToOne(() => Item, (item) => item.itemProperty)
  item?: Item;

  @Column('text', { array: true })
  values: string[];
}
