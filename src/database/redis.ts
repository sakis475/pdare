import { RedisClientType, createClient } from 'redis';

export let redisClient: RedisClientType;

export async function redisConnection() {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    });

    // Handle redis events
    redisClient
      .on('connect', () => console.log('Redis Connected'))
      .on('error', (err) => console.log('Redis Client Error', err))
      .on('end', () => console.log('Redis connection ended'));

    await redisClient.connect();

    // Handle process termination
    process.on('SIGINT', async () => {
      await gracefulShutdown();
    });

    process.on('SIGTERM', async () => {
      await gracefulShutdown();
    });
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}

export async function gracefulShutdown() {
  console.log('Closing Redis connection...');
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
  process.exit(0);
}
