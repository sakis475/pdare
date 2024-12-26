import { RedisClientType, createClient } from 'redis';

export let redisClient: any;

export async function redisConnection() {
  redisClient = await createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    },
  })
    .on('connect', () => console.log('Redis Connected'))
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
}
