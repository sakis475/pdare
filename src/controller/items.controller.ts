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
import { itemsUpdatedEmitter } from '../lib/socketio';
import { groupBy } from 'lodash';

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
  const itemsReq: Item[] = req.body;

  if (!Array.isArray(itemsReq)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;

  const newItems = itemsReq.filter((item) => !item.id);
  const itemsForUpdate = itemsReq.filter((item) => item.id);

  const categoryReq = itemsReq?.[0]?.category;
  const allCategoriesItems = await itemService.getEnabledItems(
    restaurant,
    categoryReq
  );

  for (const itemForUpdate of itemsForUpdate) {
    const existingItem = allCategoriesItems.find(
      (e) => e.id === itemForUpdate.id
    );

    existingItem.title = itemForUpdate.title;

    if (typeof itemForUpdate.orderItem !== 'number') {
      itemForUpdate.orderItem = existingItem.orderItem;
    }
  }

  const allCategoriesItemsTitles = allCategoriesItems.map((e) => e.title);

  if (
    new Set(allCategoriesItemsTitles).size !== allCategoriesItemsTitles.length
  ) {
    return next(new ErrorException(ErrorCode.TitleAlreadyExists));
  }

  if (newItems.some((e) => allCategoriesItemsTitles.includes(e.title))) {
    return next(new ErrorException(ErrorCode.TitleAlreadyExists));
  }

  const itemsForUpdateIds = itemsForUpdate.map((item) => item.id);

  // Get existing items with their properties
  const existingItems = allCategoriesItems.filter((e) =>
    itemsForUpdateIds.includes(e.id)
  );

  // Create a map of existing items for easy lookup
  const existingItemsMap = new Map(
    existingItems.map((item) => [item.id, item])
  );

  let uniqueIdsOfItemProperties: number[] = [];

  const itemsToUpdate = await Promise.all(
    itemsForUpdate.map(async (updatedItem) => {
      const existingItem = existingItemsMap.get(updatedItem.id);
      existingItem.orderItem ??= updatedItem.orderItem;
      if (!existingItem.itemProperties) {
        // Handle new items
        if (updatedItem.isEnabled === true) {
          delete updatedItem.isEnabled;
        }

        if (updatedItem.itemProperties?.length) {
          updatedItem.itemProperties.forEach((property) => {
            if (!property.id) {
              property.restaurant = restaurant;
            }
          });
        }

        return { ...updatedItem, restaurant };
      }

      // Handle existing items
      let mergedItemProperties: any[] = [];

      if (updatedItem.itemProperties?.length) {
        // Create a map of updated properties for easy lookup
        const updatedPropertiesMap = new Map(
          updatedItem.itemProperties
            .filter((prop) => prop.id)
            .map((prop) => [prop.id, prop])
        );

        // Handle existing properties
        mergedItemProperties = existingItem.itemProperties.map(
          (existingProp) => {
            const updatedProp = updatedPropertiesMap.get(existingProp.id);
            if (updatedProp) {
              // Property exists in both - update it
              uniqueIdsOfItemProperties.push(existingProp.id);
              return {
                ...existingProp,
                ...updatedProp,
                restaurant, // Ensure restaurant is preserved
              };
            }
            // Property exists only in database - preserve it
            return existingProp;
          }
        );

        // Add new properties (ones without IDs)
        const newProperties = updatedItem.itemProperties
          .filter((prop) => !prop.id)
          .map((prop) => ({
            ...prop,
            restaurant,
          }));

        mergedItemProperties = [...mergedItemProperties, ...newProperties];
      } else {
        // If no properties provided, keep existing ones
        mergedItemProperties = existingItem.itemProperties;
      }

      if (updatedItem.isEnabled === true) {
        delete updatedItem.isEnabled;
      }

      // Merge the item data
      return {
        ...existingItem,
        ...updatedItem,
        itemProperties: mergedItemProperties,
        restaurant,
      };
    })
  );

  // Validate item properties belong to restaurant
  if (uniqueIdsOfItemProperties.length > 0) {
    const countItemProperties =
      await itemPropertyService.countItemPropertiesByIds(
        uniqueIdsOfItemProperties,
        restaurant
      );

    if (countItemProperties !== uniqueIdsOfItemProperties.length) {
      return next(new ErrorException(ErrorCode.BadRequestError));
    }
  }

  // Validate items belong to restaurant
  const countItems = await itemService.countItemByIds(
    itemsForUpdate.map((e) => e.id),
    restaurant
  );

  if (countItems && itemsToUpdate.length !== countItems) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  //Create new items
  const itemsToCreate: Item[] = [];
  for (const newItem of newItems) {
    newItem.orderItem ??= newItem.orderItem;
    const createNewItem = itemService.createItem({
      ...newItem,
      restaurant,
    });

    itemsToCreate.push(createNewItem);
  }

  const allItemsUpdating = [...itemsToUpdate, ...itemsToCreate];

  // Save the merged items
  const itemsCreated = await itemService.saveItems(allItemsUpdating);

  // Get the fresh data after save
  const categoriesItems = await itemService.getEnabledItems(
    restaurant,
    existingItems?.[0]?.category ?? itemsReq?.[0]?.category
  );
  res.json(categoriesItems);
  await itemsUpdatedEmitter(restaurant);
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
