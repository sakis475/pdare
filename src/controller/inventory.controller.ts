import { NextFunction, Request, Response } from 'express';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { InventoryService } from '../services/inventory.service';
import dayjs from '../lib/dayjs';
import { resetOrderLimit } from '../lib/orderLimitting';

const inventoryService = new InventoryService();

export async function getInventory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  let inventory = await inventoryService.getInventoryByRestaurant(restaurant);

  if (
    !inventory.currentLimitEnd ||
    dayjs(inventory.currentLimitEnd).isBefore(dayjs())
  ) {
    inventory = await resetOrderLimit(inventory);
  }
  res.json(inventory);
}
