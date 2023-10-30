import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { PropertyDataType, UserType } from '../database/interfaces';
import { CategoryService } from '../services/category.service';
import { ItemService } from '../services/item.service';
import { ItemPropertyService } from '../services/itemProperty.service';
import { OrderService } from '../services/order.service';
import { OrderItemService } from '../services/orderItem.service';

import { TableService } from '../services/table.service';
import { RestaurantService } from '../services/restaurant.service';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function populateData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurantService = new RestaurantService();

  const restaurant = await restaurantService.saveRestaurant({
    restaurantName: 'touThanash'
  });

  const userService = new UserService();
  try {
    await userService.saveUser({
      username: 'sakis',
      firstName: 'thanos',
      lastName: 'pip',
      role: UserType.ADMIN,
      passwordHashed: 'asd',
      restaurant
    });
  } catch (error) {}
  const user = await userService.getUserByUsername('sakis');
  const orderService = new OrderService();
  const tableService = new TableService();
  const table = await tableService.saveTable({
    tableName: 'a1',
    status: 'open',
    restaurant
  });
  const order = await orderService.saveOrder({ user });
  const categoryService = new CategoryService();
  const coffeeCategory = await categoryService.saveCategory({
    title: 'Coffee',
    restaurant
  });
  await categoryService.saveCategory({
    title: 'Tea',
    restaurant
  });
  await categoryService.saveCategory({
    title: 'Bevarage',
    restaurant
  });
  const itemService = new ItemService();
  const item = await itemService.saveItem({
    title: 'Espresso',
    cost: 3.2,
    category: coffeeCategory,
    restaurant
  });
  const itemPropertyService = new ItemPropertyService();
  const itemProperty1 = await itemPropertyService.saveItemProperty({
    propertyName: 'sugar',
    propertyType: PropertyDataType.SINGLESELECT,
    propertyValue: 'sketos',
    item
  });
  const itemProperty2 = await itemPropertyService.saveItemProperty({
    propertyName: 'sugar',
    propertyType: PropertyDataType.SINGLESELECT,
    propertyValue: 'metrios',
    item
  });
  const itemProperty3 = await itemPropertyService.saveItemProperty({
    propertyName: 'sugar',
    propertyType: PropertyDataType.SINGLESELECT,
    propertyValue: 'glikos',
    item
  });
  const orderItemService = new OrderItemService();
  const orderItem = await orderItemService.saveOrderItem({
    order: order,
    item: item,
    itemProperty: itemProperty1,
    quantity: 2
  });
  res.json('ok');
}
