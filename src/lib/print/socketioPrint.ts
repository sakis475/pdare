import { User } from '../../database/entity/User.entity';
import { socketClientManager } from '../socketClientManager';
import { PrintBuffer } from './printHelpers';

export const sendPrintOrderBuffer = async (
  user: User,
  printBuffers: PrintBuffer[]
): Promise<void> => {
  try {
    const socket = socketClientManager.getByEmail(user.email);

    // Wrap the emit in a promise to handle acknowledgment with a timeout
    const ackPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            'Acknowledgment timeout: Client did not respond within 5 seconds.'
          )
        );
      }, 5000); // 5 seconds timeout

      socket.emit('printOrder', printBuffers, (ackResponse: any) => {
        clearTimeout(timeout); // Clear the timeout if acknowledgment is received

        if (ackResponse.status !== 'success') {
          return reject(
            new Error(`Print order failed: ${ackResponse?.message}`)
          );
        }
        console.log('Acknowledgment received from client:', ackResponse);
        resolve();
      });
    });

    // Wait for the acknowledgment or timeout
    await ackPromise;
  } catch (error) {
    console.error(
      'Error in sendPrintOrderBuffer:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    throw error; // ✅ Rethrow so BullMQ will know the job failed
  }
};
