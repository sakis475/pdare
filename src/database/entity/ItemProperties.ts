import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Category } from './Category';
import { PropertyDataType } from '../interfaces';

@Entity()
export class ItemProperties {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;

  @Column('text')
  group: string;

  @Column({
    type: 'text',
    enum: PropertyDataType
  })
  dataType: PropertyDataType;

  @Column({
    type: 'text'
  })
  value: string;
}
