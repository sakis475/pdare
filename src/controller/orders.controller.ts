import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { User } from '../database/entity/User.entity';
import { OrderService } from '../services/order.service';
import { ItemService } from '../services/item.service';
import { ErrorException } from '../error_handler/error-exception';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { OrderItemService } from '../services/orderItem.service';
import { OrderItemPropertyService } from '../services/orderItem_ItemProperty.service';
import { TableService } from '../services/table.service';
import {
  OrderDetails,
  OrderPrintItem,
  buildHtml,
  htmlStringToImageBuffer,
} from '../lib/orderPrint';
import { Table } from '../database/entity/Table.entity';
import { Order } from '../database/entity/Order.entity';
import { Item } from '../database/entity/Item.entity';
import { OrderItem } from '../database/entity/OrderItem.entity';
import dayjs from '../lib/dayjs';
import { orderUpdatedEmitter, printOrderEmitter } from '../lib/socketio';
import _ from 'lodash';
import { InventoryService } from '../services/inventory.service';
import { PrintType } from '../services/printer.service';
import { PrintLocation } from '../database/entity/Category.entity';
import { UserType } from '../database/interfaces';

const orderService = new OrderService();
const orderItemService = new OrderItemService();
const itemPropertyOfItemService = new OrderItemPropertyService();

const itemService = new ItemService();
const tableService = new TableService();

const inventoryService = new InventoryService();

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  const restaurant: Restaurant = res.locals.user.restaurant;

  const tableIdReq: number | string = req.body.table;
  const orderComment = req.body.comment;
  const couvert: number = req.body.couvert;

  const orderItemsReq: {
    id: number;
    itemProperties: {
      id: number;
      oItemPropertyId: number;
    }[];
    quantity: number;
    comment?: string;
  }[] = req.body.items;
  if (
    !Array.isArray(orderItemsReq) ||
    !['number', 'string'].includes(typeof tableIdReq) ||
    !tableIdReq
  ) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  for (const item of orderItemsReq) {
    if (!item.id || !item.itemProperties) {
      return next(new ErrorException(ErrorCode.WrongInput));
    }
  }

  let table: Table;
  if (typeof tableIdReq === 'string') {
    //created new table with given tableName
    const tableExists = await tableService.getTableByName(
      tableIdReq,
      restaurant
    );

    if (!tableExists) {
      table = tableService.createTable({
        tableName: tableIdReq,
        restaurant,
        isEnabled: false,
      });
      table = (await tableService.saveTables([table]))[0];
    } else if (tableExists.occupiedByOrder) {
      return next(new ErrorException(ErrorCode.TableIsOccupied));
    } else {
      table = tableExists;
    }
  } else {
    table = await tableService.getTableById(tableIdReq, restaurant);
    if (!table) {
      return next(new ErrorException(ErrorCode.AssetNotFound));
    }
    if (table.occupiedByOrder) {
      return next(new ErrorException(ErrorCode.TableIsOccupied));
    }
  }

  const orderCount = (
    await inventoryService.getInventoryByRestaurant(restaurant)
  ).orderCount;

  // Create the order
  const createOrder = orderService.create({
    user,
    table,
    comment: orderComment,
    couvert,
    uniqueId: `#${orderCount + 1}`,
  });

  const draftOrder = await orderService.saveOrder(createOrder);
  await inventoryService.incrementOrderCount(restaurant);

  const itemIdsReq = orderItemsReq.map((e) => e.id);

  const items = await itemService.getItemByIds(itemIdsReq, restaurant);

  const createOrderItems = orderItemsReq.map((itemDescriptionReq) => {
    const item = items.find((e) => e.id === itemDescriptionReq.id);

    return orderItemService.orderItemRepository.create({
      order: draftOrder,
      item,
      quantity: itemDescriptionReq.quantity,
      comment: itemDescriptionReq.comment ?? '',
    });
  });

  const draftOrderItems = await orderItemService.orderItemRepository.save(
    createOrderItems
  );

  console.log(draftOrderItems, 'itemProperties');
  console.log(draftOrderItems.length, 'draftOrderItemslengt');

  for (const [index, orderItem] of draftOrderItems.entries()) {
    const itemPropertiesIdsReq = orderItemsReq[index].itemProperties.map(
      (e) => e.id
    );
    console.log(itemPropertiesIdsReq, 'itemPropertiesIdsReq');
    const item = orderItem.item;

    const itemProperties = item.itemProperties.filter((e) =>
      itemPropertiesIdsReq.includes(e.id)
    );

    orderItem.itemPropertyOfItem = itemProperties.map((itemProp) =>
      itemPropertyOfItemService.create({
        orderItem,
        itemProperty: itemProp,
      })
    );
  }

  draftOrder.orderItems = draftOrderItems;

  draftOrder.finalCost = orderService.calculateFinal(
    draftOrder,
    restaurant
  ).total;

  draftOrder.activeTable = table;
  const savedOrder = await orderService.saveOrder(draftOrder);
  res.send(savedOrder);

  savedOrder.user = user;
  orderUpdatedEmitter(restaurant);
  printOrderEmitter(savedOrder, PrintType.PERSONEL);
}

export async function updateOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const user: User = res.locals.user;
  const restaurant: Restaurant = res.locals.user.restaurant;

  const tableIdReq: number | string = req.body.table;
  const orderComment: string = req.body.comment;
  const couvert: number = req.body.couvert;
  const orderIdReq: number = +req.params.orderId;

  const orderItemsReq: {
    id: number;
    oItemId: number;
    delete: boolean;
    itemProperties: {
      id: number;
      oItemPropertyId: number;
      delete: boolean;
    }[];
    quantity: number;
    comment?: string;
  }[] = req.body.items;

  if (
    !Array.isArray(orderItemsReq) ||
    !orderIdReq ||
    !['number', 'string'].includes(typeof tableIdReq)
  ) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  // Fetch the existing order
  let order = await orderService.getOrderById(orderIdReq, restaurant);
  const originalOrder = _.cloneDeep(order);

  if (!order) {
    return next(new ErrorException(ErrorCode.AssetNotFound));
  }

  let table: Table;
  if (typeof tableIdReq === 'string') {
    //created new table with given tableName
    const tableExists = await tableService.getTableByName(
      tableIdReq,
      restaurant
    );

    if (!tableExists) {
      table = tableService.createTable({
        tableName: tableIdReq,
        restaurant,
        isEnabled: false,
      });
    } else if (
      tableExists.occupiedByOrder &&
      tableExists.occupiedByOrder.id !== orderIdReq
    ) {
      return next(new ErrorException(ErrorCode.TableIsOccupied));
    } else {
      table = tableExists;
    }
  } else {
    table = await tableService.getTableById(tableIdReq, restaurant);
    if (!table) {
      return next(new ErrorException(ErrorCode.AssetNotFound));
    }
    if (table.occupiedByOrder && table.occupiedByOrder.id !== orderIdReq) {
      return next(new ErrorException(ErrorCode.TableIsOccupied));
    }
  }

  // Update the order comment and table if provided
  order.comment = orderComment ?? order.comment;
  order.table = table ?? order.table;

  const couvertChanged = order.couvert !== couvert;

  order.couvert = typeof couvert === 'number' ? couvert : order.couvert;
  // Process order_items for update and addition
  const itemIdsReq: number[] = orderItemsReq.map((e) => e.id);
  const items = await itemService.getItemByIds(itemIdsReq, restaurant);

  const createOrderItems = orderItemsReq
    .map((itemDescriptionReq) => {
      const item: Item | undefined = items.find(
        (e) => e.id === itemDescriptionReq.id
      );

      if (itemDescriptionReq.oItemId && itemDescriptionReq.delete === true) {
        const itemToMarkRemove = order.orderItems.find(
          (e) => e.id === itemDescriptionReq.oItemId
        );

        if (itemToMarkRemove) {
          itemToMarkRemove.removedAt = dayjs().toDate();
          return itemToMarkRemove;
        }
      }

      return orderItemService.orderItemRepository.create({
        order,
        item,
        quantity: itemDescriptionReq.quantity,
        comment: itemDescriptionReq.comment ?? '',
      });
    })
    .filter(Boolean); //skip empty and removed items

  // Save the new and updated order items
  const savedOrderItems = await orderItemService.orderItemRepository.save(
    createOrderItems
  );

  // Update item properties for each order item
  for (const [index, orderItem] of savedOrderItems.entries()) {
    if (orderItemsReq[index]?.delete === true) continue;
    const itemPropertiesIdsReq = orderItemsReq[index].itemProperties.map(
      (e) => e.id
    );
    const item: Item = orderItem.item;

    const itemProperties = item.itemProperties.filter((e) =>
      itemPropertiesIdsReq.includes(e.id)
    );

    orderItem.itemPropertyOfItem = itemProperties.map((itemProp) =>
      itemPropertyOfItemService.create({
        orderItem,
        itemProperty: itemProp,
      })
    );
  }

  // Save the updated order
  order.orderItems = order.orderItems.concat(savedOrderItems);

  order.finalCost = orderService.calculateFinal(order, restaurant).total;

  if (order.orderItems?.filter((e) => !e.removedAt)?.length === 0) {
    order.closedAt = dayjs().toDate();
    order.table.occupiedByOrder = null;
  }

  await tableService.clearTable(originalOrder.table);
  order.activeTable = table;

  const savedOrder: Order = await orderService.saveOrder(order);

  const tableCopy = _.cloneDeep(savedOrder.table);
  if (order.orderItems?.length === 0) {
    tableCopy.occupiedByOrder = null;
  } else {
    tableCopy.occupiedByOrder = order;
  }
  await tableService.saveTable(tableCopy);

  res.send(savedOrder);

  savedOrder.user = user;
  await orderUpdatedEmitter(restaurant);

  if (
    !order.closedAt &&
    (savedOrderItems.filter((e) => !e.removedAt)?.length || couvertChanged)
  ) {
    savedOrder.orderItems = savedOrderItems;
    await printOrderEmitter(savedOrder, PrintType.PERSONEL, couvertChanged);
  }
}

export async function printOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  let printType: PrintType = [PrintType.FINAL, PrintType.PERSONEL].includes(
    req.body.printType
  )
    ? req.body.printType
    : PrintType.PERSONEL;

  const printLocation: PrintLocation = [
    PrintLocation.ALL,
    PrintLocation.BAR,
    PrintLocation.KITCHEN,
  ].includes(req.body.printLocation)
    ? req.body.printLocation
    : PrintLocation.ALL;

  const isAnalysisPrint: boolean =
    typeof req.body.isAnalysis === 'boolean' ? req.body.isAnalysis : false;

  if (isAnalysisPrint) {
    printType = PrintType.FINAL;
  }

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== 'number') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(
    orderId,
    restaurant,
    true,
    true
  );
  if (!order) {
    return next(new ErrorException(ErrorCode.NotFound));
  }

  await printOrderEmitter(order, printType, true, printLocation, true);

  res.json();
}

export async function orderReady(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== 'number') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  if (!order) {
    return next(new ErrorException(ErrorCode.NotFound));
  }

  await orderService.markOrderAsReady(order.id);
  res.send(order);
  orderUpdatedEmitter(restaurant);
}

export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== 'number') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  res.send(order);
}

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  let fromDate: any = req.query.fromDate;

  let pageNumber: any = req.query.pageNumber;

  if (fromDate && typeof fromDate !== 'string') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  if (pageNumber && typeof pageNumber !== 'string') {
    return next(new ErrorException(ErrorCode.WrongInput));
  } else if (pageNumber) {
    pageNumber = +pageNumber;
  } else {
    pageNumber = 0;
  }

  const user: User = res.locals.user;

  if (user.role !== UserType.OWNER) {
    fromDate = dayjs().startOf('day').subtract(2, 'day').toDate();
  }

  const order = await orderService.getOrders(
    restaurant,
    fromDate,
    undefined,
    undefined,
    pageNumber
  );

  res.send(order);
}

export async function closeOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== 'number') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  if (!order) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  order.closedAt = dayjs().toDate();
  order.table.occupiedByOrder = null;

  const savedOrder: Order = await orderService.saveOrder(order);
  orderUpdatedEmitter(restaurant);
  res.json({ success: true });
}

export async function reopenOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== 'number') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  if (!order) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }
  const tableNow = await tableService.getTableById(order.table.id, restaurant);
  if (tableNow.occupiedByOrder) {
    return next(new ErrorException(ErrorCode.TableIsOccupied));
  }
  const isReopenAllowed =
    order?.closedAt && dayjs().diff(dayjs(order.closedAt), 'minute') < 15;

  if (!isReopenAllowed) {
    return next(new ErrorException(ErrorCode.UpdateIsForbidden));
  }

  order.closedAt = null;
  const savedOrder: Order = await orderService.saveOrder(order);

  tableNow.occupiedByOrder = order;

  const savedTable: Table = await tableService.saveTable(tableNow);

  orderUpdatedEmitter(restaurant);
  res.json({ success: true });
}

export async function deleteOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== 'number') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  if (!order) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  await tableService.clearTable(order.table);
  await orderService.deleteOrder(order);

  res.send(order);
}

export async function getOrderPrint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== 'number') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  const orderItems: OrderPrintItem[] = order.orderItems.map((e) => {
    return {
      itemTitle: e.item.title,
      itemDetails: e.itemPropertyOfItem
        .map((e) => `${e.itemProperty.propertyValue}`)
        .join(', '),
      itemComment: '',
      quantity: String(e.quantity),
      price: String(e.quantity * e.item.cost),
    };
  });

  const orderDetails: OrderDetails = {
    orderId: order.id,
    printNum: 1,
    userName: order.user.firstName + ' ' + order.user.lastName,
    tableName: order.table.tableName,
  };

  const html = buildHtml({ orderDetails, orderItems });

  const orderPrintImage = await htmlStringToImageBuffer(html);

  var fs = require('fs');

  fs.writeFile('./image.png', orderPrintImage, function (err: any) {
    if (err) throw err;
  });
  res.setHeader('Content-Type', 'image/png');
  res.send(orderPrintImage);
}
