import { AppDataSource } from './connection';

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: any) => {
    console.error('Error during Data Source initialization', err);
  });

export { AppDataSource };
