import { PrintLocation } from '../../database/entity/Category.entity';
import { Order } from '../../database/entity/Order.entity';
import { socketIO } from '../../server';
import { PrinterService, PrintType } from '../../services/printer.service';

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
