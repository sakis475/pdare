const dotenv = require('dotenv').config({ path: '.env' });

import { DataSource, DataSourceOptions } from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';

const config: DataSourceOptions = {
  type: 'postgres',
  driver: PlatformTools.load('pg'),
  host: process.env.DB_HOST!,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: false,
  entities: [__dirname + '/entity/*.ts'],
  migrations: [__dirname + '/migrations/*.ts'],
  dropSchema: false,
  synchronize: true,
};

export const AppDataSource = new DataSource(config);
