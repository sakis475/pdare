import { Queue } from 'bullmq';
import { bullConnection } from './bullmqConnection';

export const closeOrdersInactiveRepeatableQueue = new Queue(
  'close-inactive-orders',
  {
    connection: bullConnection,
  }
);
