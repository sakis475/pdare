import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { ItemService } from '../services/item.service';
import { Item } from '../database/entity/Item.entity';
import { CategoryService } from '../services/category.service';
import { ItemProperty } from '../database/entity/ItemProperty.entity';
import { ItemPropertyService } from '../services/itemProperty.service';
import { redisClient } from '../database/redis';
import { SortDirection } from 'src/database/interfaces';

const itemService = new ItemService();
const categoryService = new CategoryService();
const itemPropertyService = new ItemPropertyService();
export async function getItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const restaurant = res.locals.user.restaurant;

    // First, try to fetch the cached items from Redis
    // const cachedItems = await redisClient.get(`ite2ms:${restaurant.id}`);
    // if (cachedItems) {
    //   console.log("Returning cached items");
    //   return res.json(JSON.parse(cachedItems)); // Send the cached JSON back to the client
    // }

    // If not cached, fetch from the service and then cache the result
    const items = await itemService.getEnabledItems(restaurant);

    // const itemsString = JSON.stringify(items);
    // await redisClient.set(`items:${restaurant.id}`, itemsString, {
    //   EX: 3600, // Set an expiration time (e.g., 3600 seconds = 1 hour)
    // });
    // console.log("Items cached");

    // Return the fresh list of items

    res.json(items);
  } catch (error) {
    console.error('Failed to retrieve items:', error);
    next(error); // Pass errors to the Express error handler
  }
}

export async function createItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const items: {
    title: string;
    description: string;
    cost: number;
    categoryId: number;
    itemProperties: ItemProperty[];
  }[] = req.body;

  if (!Array.isArray(items)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;
  const categories = await categoryService.getCategoryByIds(
    items.map((e) => e.categoryId),
    restaurant
  );

  const distinctCategoryIds = [
    ...new Set(items.map((item) => item.categoryId)),
  ];

  if (categories?.length !== distinctCategoryIds.length) {
    return next(new ErrorException(ErrorCode.AssetNotFound));
  }

  const newItems = items.map(async (item) => {
    let itemProperties = itemPropertyService.create(item.itemProperties);

    itemProperties = itemProperties.map((e) => ({ ...e, restaurant }));

    return itemService.createItem({
      title: item.title,
      description: item.description,
      cost: item.cost,
      category: categories.find((e) => e.id === item.categoryId),
      itemProperties: itemProperties,
      restaurant,
    });
  });

  const resolvedNewItems = await Promise.all(newItems);

  await itemService.saveItems(resolvedNewItems, true);

  res.json();
}

/**
 * This can also update existing item_property, create new ones and unassign(disable) existing
 */
export async function updateItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const items: Item[] = req.body;

  if (!Array.isArray(items)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }
  const restaurant: Restaurant = res.locals.user.restaurant;

  let uniqueIdsOfItemProperties: number[] = [];

  const updateItems = items.map((e) => {
    if (e.isEnabled === true) {
      delete e.isEnabled;
    }
    if (e.itemProperties?.length) {
      uniqueIdsOfItemProperties = e.itemProperties
        .map((property) => {
          const id = property.id;
          if (typeof id === 'number') {
            return id;
          } else {
            //add restaurant to each itemProperty if itemProperty doesnt exist (is about to created)
            property.restaurant = restaurant;
          }
        })
        .filter((id) => (typeof id === 'number' ? true : false));
    }
    return { ...e, restaurant };
  });
  //check if id's given are only of restaurant and not other
  const countItemProperties =
    await itemPropertyService.countItemPropertiesByIds(
      uniqueIdsOfItemProperties,
      restaurant
    );

  if (uniqueIdsOfItemProperties?.length !== countItemProperties) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  //check if id's given are only of restaurant and not other
  const countItems = await itemService.countItemByIds(
    items.map((e) => e.id),
    restaurant
  );

  if (updateItems.length !== countItems) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  await itemService.saveItems(updateItems);

  res.json();
}

export async function updateIsEnabled(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const itemIds: number[] = req.body.itemIds;
  const isEnabled: boolean = req.body.isEnabled;

  if (!Array.isArray(itemIds) || typeof isEnabled !== 'boolean') {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;
  const items = await itemService.getItemByIds(itemIds, restaurant);

  const updateIsEnabled = items.map((e) => {
    e.isEnabled = isEnabled;
    if (e.itemProperties?.length) {
      e.itemProperties.forEach((e) => {
        e.item = null;
      });
    }
    e.restaurant = restaurant;
    return e;
  });

  await itemService.saveItems(updateIsEnabled);
  res.json();
}

export async function updateItemOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const itemId: number = +req.body.itemId;
  const sortDirection: SortDirection = req.body.sortDirection;
  const restaurant: Restaurant = res.locals.user.restaurant;

  if (!itemId || !['sortUp', 'sortDown'].some((e) => e === sortDirection)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const item = await itemService.getItemById(itemId);

  if (item?.restaurant?.id !== restaurant.id) {
    return next(new ErrorException(ErrorCode.NotFound));
  }

  const itemOrderLimits = await itemService.getItemCategoryOrderMinMax(
    item.category,
    restaurant
  );

  if (
    (item.orderItem >= itemOrderLimits.maxOrder &&
      sortDirection === 'sortDown') ||
    (item.orderItem <= itemOrderLimits.minOrder && sortDirection === 'sortUp')
  ) {
    return res.json(item);
  }

  const updatedItems = await itemService.updateItemOrder(item, sortDirection);

  res.json(updatedItems);
}
