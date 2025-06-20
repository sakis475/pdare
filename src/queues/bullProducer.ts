import { User } from '../database/entity/User.entity';
import { PrintLocation } from '../database/entity/Category.entity';
import { Order } from '../database/entity/Order.entity';
import { PrintType } from '../services/printer.service';
import { printQueue } from './bullQueues';
import { generatePrintQueueJobId } from '../lib/print/printHelpers';

export async function printOrderQueue(
  order: Order,
  printType = PrintType.PERSONEL,
  printCouvert = true,
  printLocation: PrintLocation = PrintLocation.ALL,
  isReprint = false,
  user: User
) {
  return await printQueue.add(
    generatePrintQueueJobId(user.restaurant),
    {
      order,
      printType,
      printCouvert,
      printLocation,
      isReprint,
      user,
    },
    {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3, // ✅ Allow 3 attempts
      backoff: {
        type: 'exponential', // Or 'exponential' if you prefer
        delay: 2.6, // 2.6 seconds delay between retries
      },
    }
  );
}
