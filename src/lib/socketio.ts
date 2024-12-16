import { socketIO } from '../server';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { TableService } from '../services/table.service';
import { ItemService } from '../services/item.service';
import { ItemPropertiesPatternService } from '../services/itemPropertiesPattern.service';
import { UserService } from '../services/user.service';
import { InvitationRequestService } from '../services/invitationRequest.service';
import { InvitationRequestStatus } from '../database/entity/InvitationRequest.entity';

export async function orderUpdatedEmitter(restaurant: Restaurant) {
  const tableService = new TableService();
  const tables = await tableService.getEnabledTablesWithOrder(restaurant);
  const emitSignal = `tableOrdersUpdated:${restaurant.id}`;
  const roomName = `restaurant:${restaurant.id}`;

  console.log(`Emitting ${emitSignal} to room ${roomName}`);
  socketIO.to(roomName).emit(emitSignal, tables);
}

export async function itemsUpdatedEmitter(restaurant: Restaurant) {
  const itemService = new ItemService();
  const items = await itemService.getEnabledItems(restaurant);
  const emitSignal = `itemsUpdated:${restaurant.id}`;
  const roomName = `restaurant:${restaurant.id}`;

  console.log(`Emitting ${emitSignal} to room ${roomName}`);
  socketIO.to(roomName).emit(emitSignal, items);
}

export async function itemPropertiesPatternEmitter(restaurant: Restaurant) {
  const itemPropertiesPatternService = new ItemPropertiesPatternService();
  const propertyPatterns =
    await itemPropertiesPatternService.getEnabledPatterns(restaurant);
  const emitSignal = `itemPropertyPatternsUpdated:${restaurant.id}`;
  const roomName = `restaurant:${restaurant.id}`;

  console.log(`Emitting ${emitSignal} to room ${roomName}`);
  socketIO.to(roomName).emit(emitSignal, propertyPatterns);
}

export async function usersUpdatedEmitter(restaurant: Restaurant) {
  const userService = new UserService();
  const invitationRequestService = new InvitationRequestService();

  const users = await userService.getUsersByRestaurant(restaurant);
  const activeInvitations = await invitationRequestService.getAllRequests(
    restaurant,
    InvitationRequestStatus.AWAITING
  );

  const usersAndInvitations = { users, activeInvitations };
  const emitSignal = `usersUpdated:${restaurant.id}`;
  const roomName = `restaurant:${restaurant.id}`;

  console.log(`Emitting ${emitSignal} to room ${roomName}`);
  socketIO.to(roomName).emit(emitSignal, usersAndInvitations);
}

export async function healthCheckEmitter(restaurant: Restaurant) {
  const emitSignal = `healthCheck:${restaurant.id}`;
  const roomName = `restaurant:${restaurant.id}`;
  console.log(`Emitting ${emitSignal} to room ${roomName}`);
  socketIO.to(roomName).emit(emitSignal, {
    timestamp: Date.now(),
    restaurantId: restaurant.id,
  });
}

export enum EventId {
  tableOrdersUpdated = 'tableOrdersUpdated',
  itemsUpdated = 'itemsUpdated',
  categoriesUpdated = 'categoriesUpdated',
  itemPropertyPatternsUpdated = 'itemPropertyPatternsUpdated',
  tablesUpdated = 'tablesUpdated',
  usersUpdated = 'usersUpdated',
  healthCheck = 'healthCheck',
}
