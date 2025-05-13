import { PrintLocation } from '../../database/entity/Category.entity';
import { Order } from '../../database/entity/Order.entity';
import { User } from '../../database/entity/User.entity';
import { socketIO } from '../../server';
import { PrinterService, PrintType } from '../../services/printer.service';
import { sendPrintOrderBuffer } from './socketioPrint';

const printerService = new PrinterService();

export const desktopAppSendPrint = async (
  order: Order,
  printType = PrintType.PERSONEL,
  printCouvert = true,
  printLocation: PrintLocation = PrintLocation.ALL,
  isReprint = false
) => {
  const restaurant = order.user.restaurant;
  const emitSignal = `printOrder:${restaurant.id}`;
  const roomName = `restaurant:${restaurant.id}`;

  if (!printCouvert) {
    order.couvert = null;
  }
  order = await printerService.addOrderPrintInfo(
    order,
    printType,
    printLocation,
    isReprint
  );

  if (!order) {
    console.log('No printers found, nothing to emit.');
  }

  console.log(`Emitting ${emitSignal} to room ${roomName}`);

  socketIO.to(roomName).emit(emitSignal, order);
};

export const addPrintOrderSmartphoneQueue = async (
  // order: Order,
  // printType = PrintType.PERSONEL,
  // printCouvert = true,
  // printLocation: PrintLocation = PrintLocation.ALL,
  // isReprint = false,
  user: User
) => {
  //TODO: this should instead add to a job!

  sendPrintOrderBuffer(user, Buffer.from('hello world'));
};
