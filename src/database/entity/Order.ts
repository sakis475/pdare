import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'date'
  })
  createdAt: Date;

  @Column({
    type: 'date'
  })
  closedAt: Date;
}
