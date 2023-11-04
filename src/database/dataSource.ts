import { DataSource } from 'typeorm';
import { User } from './entity/User.entity';
import { Order } from './entity/Order.entity';
import { OrderItem } from './entity/OrderItem.entity';
import { Item } from './entity/Item.entity';
import { ItemProperty } from './entity/ItemProperty.entity';
import { Category } from './entity/Category.entity';
import { Table } from './entity/Table.entity';
import { Restaurant } from './entity/Restaurant.entity';
import { OrderOrderItem_ItemPropertyItem } from './entity/OrderItem_ItemProperty.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE!,
  entities: [
    User,
    Order,
    OrderItem,
    Item,
    ItemProperty,
    Category,
    Table,
    Restaurant,
    OrderOrderItem_ItemPropertyItem
  ],
  migrations: ['./migrations/*.ts'],
  synchronize: true
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: any) => {
    console.error('Error during Data Source initialization', err);
  });

export { AppDataSource };
