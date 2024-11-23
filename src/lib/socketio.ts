import { io } from '../server';
import { Order } from '../database/entity/Order.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { TableService } from '../services/table.service';
import { ItemService } from '../services/item.service';
import { ItemPropertiesPatternService } from '../services/itemPropertiesPattern.service';

export async function orderUpdatedEmitter(restaurant: Restaurant) {
  const tableService = new TableService();
  const tables = await tableService.getEnabledTablesWithOrder(restaurant);
  io.emit(`tableOrdersUpdated:${restaurant.id}`, tables);
}

export async function itemsUpdatedEmitter(restaurant: Restaurant) {
  const itemService = new ItemService();
  const items = await itemService.getEnabledItems(restaurant);
  io.emit(`itemsUpdated:${restaurant.id}`, items);
}

export async function itemPropertiesPatternEmitter(restaurant: Restaurant) {
  const itemPropertiesPatternService = new ItemPropertiesPatternService();
  const propertyPatterns =
    await itemPropertiesPatternService.getEnabledPatterns(restaurant);
  io.emit('itemPropertyPatternsUpdated:1', propertyPatterns);
}

export enum EventId {
  tableOrdersUpdated = 'tableOrdersUpdated',
  itemsUpdated = 'itemsUpdated',
}
