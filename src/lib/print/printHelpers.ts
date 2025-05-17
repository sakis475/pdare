import { CharacterSet, PrinterTypes } from 'node-thermal-printer';
import { PrintLocation } from '../../database/entity/Category.entity';
import { Order } from '../../database/entity/Order.entity';
import { socketIO } from '../../server';
import { PrinterService, PrintType } from '../../services/printer.service';
import OrderPrinterAdapter from './Print';
import { Restaurant } from '../../database/entity/Restaurant.entity';

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

export const printOrder = async (
  order: Order,
  printType = PrintType.PERSONEL,
  printCouvert = true,
  printLocation: PrintLocation = PrintLocation.ALL,
  isReprint = false
) => {
  if (!printCouvert) {
    order.couvert = null;
  }

  const prepareOrder = await printerService.addOrderPrintInfo(
    order,
    printType,
    printLocation,
    isReprint
  );

  const printerToPrint = prepareOrder.orderPrinters;

  const bufferToPrinter: PrintBuffer[] = [];

  for (const printer of printerToPrint) {
    if (!printer.orderItems?.length) {
      //If no orderItems for this printer skip
      continue;
    }

    const printerIP = printer.overrideIP;

    const printerPort = printer.overridePort ? printer.overridePort : 9100;

    const portString = printerPort ? String(printerPort) : undefined;
    const characterSet = printer.characterSet
      ? printer.characterSet
      : CharacterSet.PC737_GREEK;

    const templateGreek = {
      orderInfo: {
        showOrderNumber: true,
        showDate: true,
        showTime: true,
        showTable: true,
        showServer: true,
        orderNumberLabel: 'Αριθμός Παραγγελίας',
        datePrint: 'Ημ. Εκτύπωσης',
        dateLabel: 'Ημερομηνία',
        timeLabel: 'Ώρα',
        tableLabel: 'Τραπέζι',
        serverLabel: 'Σερβιτόρος',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: 'HH:mm:ss',
      },
      orderTitle: 'ΑΝΑΛΥΣΗ ΠΑΡΑΓΓΕΛΙΑΣ',
      items: {
        couvertText: 'Κουβέρ',
      },
      totals: {
        totalLabel: 'ΣΥΝΟΛΟ',
      },
    };

    const templateEnglish = {
      orderInfo: {
        showOrderNumber: true,
        showDate: true,
        showTime: true,
        showTable: true,
        showServer: true,
        orderNumberLabel: 'Order Number',
        datePrint: 'Print Date',
        dateLabel: 'Date',
        timeLabel: 'Time',
        tableLabel: 'Table',
        serverLabel: 'Waiter',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: 'HH:mm:ss',
      },
      orderTitle: 'ORDER ANALYSIS',
      items: {
        couvertText: 'Couvert',
      },
      totals: {
        totalLabel: 'TOTAL',
      },
    };

    const printerAdapter = new OrderPrinterAdapter(
      {
        printerIP,
        printerPort: portString,
        printerType: PrinterTypes.EPSON,
        characterSet,
      },
      order.user.restaurant?.restaurantLanguage === 'lang_en'
        ? templateEnglish
        : templateGreek
    );
    const buffer = await printerAdapter.printOrder(
      prepareOrder,
      printer.orderItems
    );
    if (buffer) {
      const printerAddress = `${printerIP}:${portString}`;
      bufferToPrinter.push({ printerAddress, buffer });
    } else {
      console.log('Failed to print order');
    }
  }

  return bufferToPrinter;
};

export const generatePrintQueueJobId = (restaurant: Restaurant) => {
  return `print-job-restaurant-${restaurant.id}`;
};

export type PrintBuffer = { printerAddress: string; buffer: string };
