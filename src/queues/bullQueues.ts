import { Queue } from 'bullmq';
import { bullConnection } from './bullmqConnection';

export const printQueue = new Queue('order-print-queue', {
  connection: bullConnection,
});
