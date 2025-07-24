import { Worker } from 'bullmq';
import { bullConnection } from './bullmqConnection';
import { Order } from '../database/entity/Order.entity';
import { PrintLocation } from '../database/entity/Category.entity';
import { User } from '../database/entity/User.entity';
import { PrintType } from '../services/printer.service';
import { printOrder } from '../lib/print/printHelpers';
import { sendPrintOrderBuffer } from '../lib/print/socketioPrint';
import { OrderService } from '../services/order.service';

export function startWorkers() {
  const orderPrintQueueWorker = new Worker(
    'order-print-queue',

    async (job) => {
      const buffer = job.data as {
        order: Order;
        printType: PrintType;
        printCouvert: boolean;
        printLocation: PrintLocation;
        isReprint: boolean;
        user: User;
      };

      const printBuffers = await printOrder(
        buffer.order,
        buffer.printType,
        buffer.printCouvert,
        buffer.printLocation,
        buffer.isReprint
      );

      await sendPrintOrderBuffer(buffer.user, printBuffers);
    },
    {
      connection: bullConnection,
      concurrency: 1,
      removeOnComplete: { age: 2592000 },
    } //remove months old
  );

  orderPrintQueueWorker.on('completed', (job) =>
    console.log(`✅ Print job ${job.id} done`)
  );
  orderPrintQueueWorker.on('failed', (job, err) =>
    console.error(`❌ Print job ${job.id} failed`, err)
  );
  console.log('🚀 BullMQ Worker started');

  // Worker for closing inactive orders
  const closeOrdersInactiveWorker = new Worker(
    'close-inactive-orders',
    async (job) => {
      const orderService = new OrderService();

      await orderService.autoCloseOrders();
    },
    {
      connection: bullConnection,
      concurrency: 1,
      removeOnComplete: { age: 1000 * 60 * 60 * 24 * 3 },
    }
  );

  closeOrdersInactiveWorker.on('completed', (job) =>
    console.log(`✅ closeOrdersInactive job ${job.id} done`)
  );
  closeOrdersInactiveWorker.on('failed', (job, err) =>
    console.error(`❌ closeOrdersInactive job ${job.id} failed`, err)
  );
}
