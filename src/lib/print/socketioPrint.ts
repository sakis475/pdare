import { User } from '../../database/entity/User.entity';
import {
  connectedSocketUsers,
  socketClientManager,
} from '../socketClientManager';

export const sendPrintOrderBuffer = (user: User, printBuffer: Buffer) => {
  try {
    const socket = socketClientManager.getByEmail(user.email);
    socket.emit(`printOrder`, { data: '123' });
  } catch (error) {
    console.log(error);
  }
};
