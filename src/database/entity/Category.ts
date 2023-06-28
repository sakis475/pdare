import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('text')
  title: string;
}
