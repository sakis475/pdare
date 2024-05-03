import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./Category.entity";
import { ItemProperty } from "./ItemProperty.entity";
import { Restaurant } from "./Restaurant.entity";

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: "text" })
  title: string;

  @OneToMany(() => ItemProperty, (itemProperty) => itemProperty.item, {
    eager: true,
    cascade: true,
  })
  itemProperties?: ItemProperty[];

  @Column({ type: "float" })
  cost: number;

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @Column({ nullable: true })
  orderItem?: number;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;

  @Column({ default: true })
  isEnabled?: boolean;
}
