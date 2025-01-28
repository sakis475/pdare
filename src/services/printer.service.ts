import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Restaurant } from '../database/entity/Restaurant.entity';

import { Printer } from '../database/entity/Printer.entity';
import { PrintLocation } from '../database/entity/Category.entity';
import { Order } from '../database/entity/Order.entity';
import { OrderItem } from '../database/entity/OrderItem.entity';
import { sortBy } from 'lodash';

export class PrinterService {
  printerRepository: Repository<Printer>;

  constructor() {
    this.printerRepository = AppDataSource.getRepository(Printer);
  }

  public createPrinter(printerData: Partial<Printer>): Printer {
    return this.printerRepository.create(printerData);
  }

  public async getPrinters(
    restaurant: Restaurant,
    onlyActive?: boolean
  ): Promise<Printer[]> {
    const whereCondition: any = {
      restaurant: { id: restaurant.id },
    };

    if (onlyActive) {
      whereCondition.active = true;
    }

    return await this.printerRepository.find({
      where: whereCondition,
      order: {
        createdAt: 'ASC',
      },
    });
  }

  public async getPrinterById(
    restaurant: Restaurant,
    id: number
  ): Promise<Printer> {
    const whereCondition: any = {
      id,
      restaurant: { id: restaurant.id },
    };

    return await this.printerRepository.findOneBy(whereCondition);
  }

  public async addOrderPrintInfo(order: Order, printType: PrintType) {
    const restaurant = order.user.restaurant;
    const printers = await this.getPrinters(restaurant, true);

    const orderPrinters: OrderPrinters[] = printers.map((printer) => {
      const orderItemsFiltered =
        printer.printLocation === PrintLocation.ALL
          ? order.orderItems
          : order.orderItems.filter(
              (e) => e.item.category.printLocation === printer.printLocation
            );

      const orderItemsSorted = orderItemsFiltered.sort((a, b) =>
        a.item.category.printLocation === PrintLocation.BAR ? -1 : 1
      );

      return {
        mac: printer.printerMac,
        printLocation: printer.printLocation,
        overrideIP: printer.overrideIP,
        overridePort: printer.overridePort,
        characterSet: printer.characterSet,
        orderItems: orderItemsSorted,
      };
    });

    const { orderItems, ...orderWithoutOrderItems } = order;

    return {
      ...orderWithoutOrderItems,
      orderPrinters,
      printType,
    };
  }

  public async savePrinter(printer: Printer): Promise<Printer> {
    return this.printerRepository.save(printer);
  }

  public async getPrinterByMac(
    mac: string,
    restaurant: Restaurant
  ): Promise<Printer | null> {
    return this.printerRepository.findOne({
      where: {
        printerMac: mac,
        restaurant: { id: restaurant.id },
      },
    });
  }
}

export enum PrintType {
  PERSONEL = 'personel',
  FINAL = 'final',
}

export type orderPrint = {
  printers: OrderPrinters[];
  printType: PrintType;
};

export type OrderPrinters = {
  mac: string;
  printLocation: PrintLocation;
  overrideIP?: string;
  overridePort?: string;
  characterSet?: any;
  orderItems: OrderItem[];
};
