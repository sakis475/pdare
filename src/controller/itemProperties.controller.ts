import { NextFunction, Request, Response } from "express";
import { ErrorCode } from "../error_handler/error-code";
import { ErrorException } from "../error_handler/error-exception";
import { Restaurant } from "../database/entity/Restaurant.entity";
import { ItemService } from "../services/item.service";
import { Item } from "../database/entity/Item.entity";
import { CategoryService } from "../services/category.service";
import { ItemProperty } from "../database/entity/ItemProperty.entity";
import { ItemPropertyService } from "../services/itemProperty.service";
import { redisClient } from "../database/redis";

const itemService = new ItemService();
const categoryService = new CategoryService();
const itemPropertyService = new ItemPropertyService();
export async function suggestItemProperties(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const restaurant = res.locals.user.restaurant;

    const categoryId = req.body.categoryId;

    const category = await categoryService.getCategoryById(categoryId);

    if (!category) {
      return next(new ErrorException(ErrorCode.WrongInput));
    }

    const itemProperties =
      await itemPropertyService.getItemPropertiesOfCategory(
        category,
        restaurant
      );

    res.json(itemProperties);
  } catch (error) {
    console.error("Failed to retrieve items:", error);
    next(error); // Pass errors to the Express error handler
  }
}
