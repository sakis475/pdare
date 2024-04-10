import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { ItemService } from '../services/item.service';
import { Item } from '../database/entity/Item.entity';
import { CategoryService } from '../services/category.service';
import { ItemProperty } from '../database/entity/ItemProperty.entity';
import { ItemPropertyService } from '../services/itemProperty.service';

const itemService = new ItemService();
const categoryService = new CategoryService();
const itemPropertyService = new ItemPropertyService();
export async function getItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const items = await itemService.getEnabledItems(restaurant);

  res.json(items);
}
export async function createItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const items: {
    title: string;
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
    ...new Set(items.map((item) => item.categoryId))
  ];

  if (categories?.length !== distinctCategoryIds.length) {
    return next(new ErrorException(ErrorCode.AssetNotFound));
  }

  const newItems = items.map(async (item) => {
    let itemProperties = itemPropertyService.create(item.itemProperties);

    itemProperties = itemProperties.map((e) => ({ ...e, restaurant }));

    return itemService.createItem({
      title: item.title,
      cost: item.cost,
      category: categories.find((e) => e.id === item.categoryId),
      itemProperties: itemProperties,
      restaurant
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

export async function disableItems(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const itemIds: number[] = req.body;

  if (!Array.isArray(itemIds)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;
  const items = await itemService.getItemByIds(itemIds, restaurant);

  const disableItems = items.map((e) => {
    e.isEnabled = false;
    if (e.itemProperties?.length) {
      e.itemProperties.forEach((e) => {
        e.item = null;
      });
    }
    e.restaurant = restaurant;
    return e;
  });

  await itemService.saveItems(disableItems);

  res.json();
}
