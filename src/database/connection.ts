const dotenv = require('dotenv').config({ path: '.env' });
import { DataSource, DataSourceOptions } from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';
import path from 'path';

console.log('Environment variables:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  env_type: process.env.ENV_TYPE,
});

const isDev = process.env.ENV_TYPE?.toUpperCase() === 'DEV';
const extension = isDev ? 'ts' : 'js';

console.log('Running in', isDev ? 'development' : 'production', 'mode');
console.log('Using file extension:', extension);

console.log('Entities Path:', path.join(__dirname, 'entity', `*.${extension}`));
console.log(
  'Migrations Path:',
  path.join(__dirname, 'migrations', `*.${extension}`)
);

const config: DataSourceOptions = {
  type: 'postgres',
  driver: PlatformTools.load('pg'),
  host: process.env.DB_HOST!,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: false,
  entities: [path.join(__dirname, 'entity', '*.{js,ts}')],
  migrations: [path.join(__dirname, 'database', 'migrations', '*.{js,ts}')],
  dropSchema: false,
  synchronize: false,
};

if (process.env.ENV_TYPE !== 'DEV') {
  Object.assign(config, {
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export const AppDataSource = new DataSource(config);
