import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword, passwordHash } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';
import { UserType } from '../database/interfaces';
import { User } from '../database/entity/User.entity';
import { CategoryService } from '../services/category.service';
import { Restaurant } from '../database/entity/Restaurant.entity';

const categoryService = new CategoryService();

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const title: string = req.body.title;

  if (!title) {
    return next(new ErrorException(ErrorCode.WrongInput));
  }

  const newCategory = { title: title, restaurant: res.locals.user.restaurant };

  await categoryService.saveCategory(newCategory);

  res.json();
}

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
