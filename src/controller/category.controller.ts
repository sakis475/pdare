import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { CategoryService } from '../services/category.service';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { Category } from '../database/entity/Category.entity';

const categoryService = new CategoryService();

export async function createCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const categories: { title: string }[] = req.body;

  if (!Array.isArray(categories)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;

  const newCategories = categories.map((e) =>
    categoryService.createCategory({ ...e, restaurant })
  );

  await categoryService.saveCategories(newCategories);

  res.json();
}

export async function updateCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const categories: Category[] = req.body;

  if (!Array.isArray(categories)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;

  const updateCategories = categories.map((e) => ({ ...e, restaurant }));

  //check if id's given are only of restaurant and not other
  const countCategories = await categoryService.countCategoryByIds(
    updateCategories.map((e) => e.id),
    restaurant
  );
  if (updateCategories.length !== countCategories) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  await categoryService.saveCategories(updateCategories);

  res.json();
}

export async function getActiveCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;

  const categories = await categoryService.getActiveCategories(restaurant);

  res.json(categories);
}

export async function deleteCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const categoryIds: number[] = req.body;

  if (!Array.isArray(categoryIds)) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const restaurant: Restaurant = res.locals.user.restaurant;

  const categories = await categoryService.getCategoryByIds(
    categoryIds,
    restaurant
  );

  await categoryService.deleteCategories(categories);

  res.json();
}
