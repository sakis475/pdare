import { DataSource } from 'typeorm';
import { User } from './entity/User';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE!,
  entities: [User],
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
