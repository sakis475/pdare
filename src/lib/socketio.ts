import { io } from '../server';
import { Order } from '../database/entity/Order.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { TableService } from '../services/table.service';

export async function orderUpdatedEmitter(order: Order) {
  const restaurant = order.user.restaurant;
  const tableService = new TableService();
  const tables = await tableService.getEnabledTablesWithOrder(restaurant);
  io.emit(`tableOrdersUpdated:${restaurant.id}`, tables);
}

export enum EventId {
  tableOrdersUpdated = 'tableOrdersUpdated',
  itemsUpdated = 'itemsUpdated',
}
