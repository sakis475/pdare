import { NextFunction, Request, Response } from 'express';

import { User } from '../database/entity/User.entity';

import {
  printesDiscoveredEmitter,
  requestPrinterScanEmitter,
} from '../lib/socketio';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { PrinterService } from '../services/printer.service';
import { PrintLocation } from '../database/entity/Category.entity';
import { Printer } from '../database/entity/Printer.entity';
import _, { uniqueId } from 'lodash';
import dayjs from '../lib/dayjs';

const printerService = new PrinterService();

export async function getAvailablePrinters(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;

  const printers = await printerService.getPrinters(user.restaurant);
  res.json(printers);
}

export async function createPrinter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { printer }: { printer: Printer } = req.body;
  console.log(printer, 'printer');
  const user: User = res.locals.user;

  const restaurant = user.restaurant;

  printer.restaurant = restaurant;

  const random = Math.floor(Math.random() * 1000) + 1;

  printer.printerMac = `custom-printer-${random}-${dayjs().unix()}`;

  await printerService.savePrinter(printer);

  const allPrinters = await printerService.getPrinters(user.restaurant);

  for (const printer of allPrinters) {
    delete printer.restaurant.printerAppConnectionCode;
  }

  res.json(allPrinters);
}

export async function updatePrinter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { printer }: { printer: Printer } = req.body;
  const user: User = res.locals.user;

  const existingPrinter = await printerService.getPrinterById(
    user.restaurant,
    printer.id
  );

  const mergedPrinter = _.merge(
    existingPrinter,
    _.pick(printer, _.keys(existingPrinter))
  );

  await printerService.savePrinter(mergedPrinter);

  const allPrinters = await printerService.getPrinters(user.restaurant);

  for (const printer of allPrinters) {
    delete printer.restaurant.printerAppConnectionCode;
  }

  res.json(allPrinters);
}
export async function requestPrinterScan(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  requestPrinterScanEmitter(user.restaurant);
  res.json();
}

export async function printersDiscovered(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { printers } = req.body;
    const restaurant: Restaurant = res.locals.restaurant;
    console.log('Received printers:', JSON.stringify(printers, null, 2));

    if (!Array.isArray(printers)) {
      return res.json();
    }

    const printerService = new PrinterService();

    // Get existing printers for this restaurant
    const existingPrinters = await printerService.getPrinters(restaurant);

    const uniqueNickname = `Printer${String.fromCharCode(
      65 +
        existingPrinters.filter((p) => p.printerNickname.startsWith('Printer'))
          .length
    )}`;

    const existingPrintersByMac = new Map(
      existingPrinters.map((p) => [p.printerMac, p])
    );

    // Process each printer
    const processedPrinters = await Promise.all(
      printers.map(async (printer) => {
        if (
          printer &&
          printer.online === true &&
          typeof printer.ip === 'string' &&
          typeof printer.mac === 'string' &&
          typeof printer.port === 'number'
        ) {
          // Check if printer already exists
          const existingPrinter = existingPrintersByMac.get(printer.mac);

          if (existingPrinter) {
            // Update existing printer
            existingPrinter.printerIp = printer.ip;
            existingPrinter.printerPort = printer.port.toString();

            if (printer.online === true) {
              existingPrinter.active = true;
            }
            // Don't overwrite nickname if it exists
            if (!existingPrinter.printerNickname) {
              existingPrinter.printerNickname =
                printer.nickname || 'Unnamed Printer';
            }

            existingPrinter.lastDiscovered = dayjs().toDate();
            return await printerService.savePrinter(existingPrinter);
          } else {
            // Create new printer
            const newPrinter = printerService.createPrinter({
              printerNickname: uniqueNickname || 'Unnamed Printer',
              printerMac: printer.mac,
              printerIp: printer.ip,
              printerPort: printer.port.toString(),
              restaurant,
              printLocation: PrintLocation.ALL,
            });
            newPrinter.lastDiscovered = dayjs().toDate();
            return await printerService.savePrinter(newPrinter);
          }
        }
        return null;
      })
    );

    // Filter out null values and get successfully processed printers
    const savedPrinters = processedPrinters.filter((p) => p !== null);

    // Mark printers not found in scan as inactive
    const scannedMacs = new Set(printers.map((p) => p.mac));
    await Promise.all(
      existingPrinters
        .filter((p) => !scannedMacs.has(p.printerMac))
        .map(async (p) => {
          p.active = false;
          return await printerService.savePrinter(p);
        })
    );

    await printesDiscoveredEmitter(restaurant, savedPrinters);

    res.json({
      success: true,
      savedCount: savedPrinters.length,
      printers: savedPrinters,
    });
  } catch (error) {
    next(error);
  }
}
