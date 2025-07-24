import { closeOrdersInactiveRepeatableQueue } from './bullRepeatableQueues';

//Start the repeatable queues
export function startRepeatableQueues() {
  // This will ensure that the repeatable job is added when the application starts
  console.log('Starting repeatable queues...');
  closeOrdersInactiveRepeatableQueue.add(
    'close-inactive-orders',
    {},
    {
      repeat: { every: 60 * 60 * 1000 }, // every 1 hour in milliseconds
    }
  );
  console.log('Repeatable queues started');
}
