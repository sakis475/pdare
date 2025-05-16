import { Worker } from 'bullmq';
import { bullConnection } from './bullmqConnection';

export function startWorkers() {
  const worker = new Worker(
    'order-print-queue',
    async (job) => {
      const buffer = job.data.buffer;
      console.log('🖨️ Processing print buffer for order...');
      // Send to client or printer
    },
    { connection: bullConnection }
  );

  worker.on('completed', (job) => console.log(`✅ Print job ${job.id} done`));
  worker.on('failed', (job, err) =>
    console.error(`❌ Print job ${job.id} failed`, err)
  );
  console.log('🚀 BullMQ Worker started');
}
