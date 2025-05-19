import IORedis from 'ioredis';

export const bullConnection = new IORedis({
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
});
