import { NextFunction, Request, Response } from "express";
import { ErrorCode } from "../error_handler/error-code";
import { User } from "../database/entity/User.entity";
import { OrderService } from "../services/order.service";
import { ItemService } from "../services/item.service";
import { ErrorException } from "../error_handler/error-exception";
import { Restaurant } from "../database/entity/Restaurant.entity";
import { OrderItemService } from "../services/orderItem.service";
import { OrderItemPropertyService } from "../services/orderItem_ItemProperty.service";
import { TableService } from "../services/table.service";
import {
  OrderDetails,
  OrderPrintItem,
  buildHtml,
  htmlStringToImageBuffer,
} from "../lib/orderPrint";

const orderService = new OrderService();
const orderItemService = new OrderItemService();
const itemPropertyOfItemService = new OrderItemPropertyService();

const itemService = new ItemService();
const tableService = new TableService();

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  const restaurant: Restaurant = res.locals.user.restaurant;

  const tableIdReq = req.body.table;
  const orderComment = req.body.comment;
  const orderItemsReq: {
    id: number;
    itemProperties: number[];
    quantity: number;
    comment?: string;
  }[] = req.body.items;

  if (
    !Array.isArray(orderItemsReq) ||
    "number" !== typeof tableIdReq ||
    !tableIdReq
  ) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  for (const item of orderItemsReq) {
    if (!item.id || !item.itemProperties) {
      return next(new ErrorException(ErrorCode.WrongInput));
    }
  }

  const table = await tableService.getTableById(tableIdReq);

  if (!table) {
    return next(new ErrorException(ErrorCode.AssetNotFound));
  }

  //TODO: CHECK IF TABLE ALREADY IS OPEN!!

  const createOrder = orderService.create({
    user,
    table,
    comment: orderComment,
  });
  const draftOrder = await orderService.saveOrder(createOrder);

  const itemIdsReq = orderItemsReq.map((e) => e.id);

  const items = await itemService.getItemByIds(itemIdsReq, restaurant);

  const createOrderItems = orderItemsReq.map((itemDescriptionReq) => {
    const item = items.find((e) => e.id === itemDescriptionReq.id);

    return orderItemService.orderItemRepository.create({
      order: draftOrder,
      item,
      quantity: itemDescriptionReq.quantity,
      comment: itemDescriptionReq.comment ?? "",
    });
  });

  const draftOrderItems = await orderItemService.orderItemRepository.save(
    createOrderItems
  );

  //draftOrderItems is in the same order and length of orderItemsReq
  draftOrderItems.forEach((orderItem, index) => {
    const itemPropertiesIdsReq = orderItemsReq[index].itemProperties;
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
  });

  draftOrder.orderItems = draftOrderItems;

  const savedOrder = await orderService.saveOrder(draftOrder);
  res.send(savedOrder);
}

export async function updateOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = res.locals.user;
  const restaurant: Restaurant = res.locals.user.restaurant;

  const tableIdReq = req.body.table;
  const orderItemsReq: {
    id: number;
    itemProperties: number[];
    quantity: number;
  }[] = req.body.items;

  if (
    !Array.isArray(orderItemsReq) ||
    "number" !== typeof tableIdReq ||
    !tableIdReq
  ) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  for (const item of orderItemsReq) {
    if (!item.id || !item.itemProperties) {
      return next(new ErrorException(ErrorCode.WrongInput));
    }
  }

  const table = await tableService.getTableById(tableIdReq);

  if (!table) {
    return next(new ErrorException(ErrorCode.AssetNotFound));
  }

  const createOrder = orderService.create({ user, table });
  const draftOrder = await orderService.saveOrder(createOrder);

  const itemIdsReq = orderItemsReq.map((e) => e.id);

  const items = await itemService.getItemByIds(itemIdsReq, restaurant);

  const createOrderItems = orderItemsReq.map((itemDescriptionReq) => {
    const item = items.find((e) => e.id === itemDescriptionReq.id);

    return orderItemService.orderItemRepository.create({
      order: draftOrder,
      item,
      quantity: itemDescriptionReq.quantity,
    });
  });

  const draftOrderItems = await orderItemService.orderItemRepository.save(
    createOrderItems
  );

  //draftOrderItems is in the same order and length of orderItemsReq
  draftOrderItems.forEach((orderItem, index) => {
    const itemPropertiesIdsReq = orderItemsReq[index].itemProperties;
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
  });

  draftOrder.orderItems = draftOrderItems;

  const savedOrder = await orderService.saveOrder(draftOrder);
  res.send(savedOrder);
}

export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== "number") {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  res.send(order);
}

export async function deleteOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const orderId: number = Number(req.params.orderId);

  if (typeof orderId !== "number") {
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

  if (typeof orderId !== "number") {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const order = await orderService.getOrderById(orderId, restaurant);

  const orderItems: OrderPrintItem[] = order.orderItems.map((e) => {
    return {
      itemTitle: e.item.title,
      itemDetails: e.itemPropertyOfItem
        .map((e) => `${e.itemProperty.propertyValue}`)
        .join(", "),
      itemComment: "",
      quantity: String(e.quantity),
      price: String(e.quantity * e.item.cost),
    };
  });

  const orderDetails: OrderDetails = {
    orderId: order.id,
    printNum: 1,
    userName: order.user.firstName + " " + order.user.lastName,
    tableName: order.table.tableName,
  };

  const html = buildHtml({ orderDetails, orderItems });

  const orderPrintImage = await htmlStringToImageBuffer(html);

  var fs = require("fs");

  fs.writeFile("./image.png", orderPrintImage, function (err: any) {
    if (err) throw err;
  });
  res.setHeader("Content-Type", "image/png");
  res.send(orderPrintImage);
}
