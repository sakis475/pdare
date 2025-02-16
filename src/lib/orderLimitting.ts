import { Inventory } from '../database/entity/Inventory.entity';
import { InventoryService } from '../services/inventory.service';
import dayjs from './dayjs';

const inventoryService = new InventoryService();

export const addOrderToCountLimit = async (
  inventory: Inventory
): Promise<Boolean> => {
  //Limit now can reset
  if (
    !inventory.currentLimitStart ||
    dayjs(inventory.currentLimitEnd).isBefore(dayjs())
  ) {
    inventory.currentLimitStart = dayjs().toDate();
    inventory.currentLimitEnd = dayjs().add(24, 'hours').toDate();
    inventory.currentLimitCount = 1;
    await inventoryService.saveInventory(inventory);
    return true;
  } else if (
    inventory.currentLimitCount >= inventory.restaurant.orderDailyLimit
  ) {
    if (typeof inventory.restaurant.orderDailyLimit === 'number') return false;
    else return true;
  } else {
    //Else just add 1 order to currentLimit
    await inventoryService.inventoryRepository.increment(
      { restaurant: { id: inventory.restaurant.id } },
      'currentLimitCount',
      1
    );
    return true;
  }
};

export const resetOrderLimit = async (inventory: Inventory) => {
  inventory.currentLimitStart = dayjs().toDate();
  inventory.currentLimitEnd = dayjs().add(24, 'hours').toDate();
  inventory.currentLimitCount = 0;
  return await inventoryService.saveInventory(inventory);
};
