import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Restaurant } from "./Restaurant.entity";

export enum PrintLocation {
  KITCHEN = "kitchen",
  BAR = "bar",
  ALL = "all",
}

@Entity()
@Index(["title", "restaurant"], { unique: true })
export class Category {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column("text")
  title: string;

  @Column({ nullable: true })
  orderCategory?: number;

  @Column({
    type: "enum",
    enum: PrintLocation,
    default: PrintLocation.ALL,
  })
  printLocation?: PrintLocation;

  @ManyToOne(() => Restaurant, { nullable: false })
  restaurant: Restaurant;
}
