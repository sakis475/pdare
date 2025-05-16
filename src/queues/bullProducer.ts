import { Queue } from 'bullmq';
import { bullConnection } from './bullmqConnection';
import { User } from '../database/entity/User.entity';
import { PrintLocation } from '../database/entity/Category.entity';
import { Order } from '../database/entity/Order.entity';
import { PrintType } from '../services/printer.service';
import { printQueue } from './bullQueues';
import dayjs from '../lib/dayjs';

export async function printOrderQueue(
  order: Order,
  printType = PrintType.PERSONEL,
  printCouvert = true,
  printLocation: PrintLocation = PrintLocation.ALL,
  isReprint = false,
  user: User
) {
  return await printQueue.add(
    `print-order-${order.id}-${dayjs().toISOString()}`,
    {
      order,
      printType,
      printCouvert,
      printLocation,
      isReprint,
      user,
    }
  );
}
