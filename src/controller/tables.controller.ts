import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { TableService } from '../services/table.service';
import { Table } from '../database/entity/Table.entity';
import { orderUpdatedEmitter } from '../lib/socketio';

const tableService = new TableService();

export async function getTables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;
  const onlyAvailableTables: boolean = req.query.availableOnly === 'true';
  const tables = await tableService.getEnabledTablesWithOrder(
    restaurant,
    onlyAvailableTables
  );

  res.json(tables);
}
export async function createTables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tables: { tableName: string }[] = req.body;

  if (!Array.isArray(tables)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;

  const newTables = tables.map((e) =>
    tableService.createTable({
      ...e,
      restaurant,
    })
  );

  await tableService.saveTables(newTables);

  res.json();
}

export async function updateTables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let tables: Table[] = req.body;
  console.log(JSON.stringify(tables));
  if (!Array.isArray(tables)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }
  const restaurant: Restaurant = res.locals.user.restaurant;

  tables = tables.map((e) => {
    if (e.isEnabled === true) {
      delete e.isEnabled;
    }
    return { ...e, restaurant };
  });

  const updateTables = tables.filter((e) => e.id);
  const createTables = tables.filter((e) => !e.id);

  //check if id's given are only of restaurant and not other
  const countTables = await tableService.countTableByIds(
    updateTables.map((e) => e.id),
    restaurant
  );

  if (updateTables.length !== countTables) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  const allTablesUpdate = updateTables.concat(createTables);

  await tableService.saveTables(allTablesUpdate);

  const updatedTables = await tableService.getEnabledTables(restaurant);

  res.json(updatedTables);

  await orderUpdatedEmitter(restaurant);
}

export async function getOnlyActiveTables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;
  const tables = await tableService.getEnabledTables(restaurant);
  res.json(tables);
}

export async function disableTables(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // const tableIds: number[] = req.body;
  // if (!Array.isArray(tableIds)) {
  //   return next(new ErrorException(ErrorCode.WrongInput));
  // }
  // const restaurant: Restaurant = res.locals.user.restaurant;
  // const tables = await tableService.getTableBy(restaurant, tableIds, null);
  // const disableTables = tables.map((e) => {
  //   e.isEnabled = false;
  //   return e;
  // });
  // await tableService.saveTables(disableTables);
  // res.json(disableTables);
}
