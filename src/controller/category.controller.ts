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

  // Separate new categories from updates
  const newCategories = categories.filter((e) => !e.id);
  const categoriesToUpdate = categories.filter((e) => e.id);

  // Verify that all categories to update belong to this restaurant
  const countCategories = await categoryService.countCategoryByIds(
    categoriesToUpdate.map((cat) => cat.id),
    restaurant
  );

  if (categoriesToUpdate.length !== countCategories) {
    return next(new ErrorException(ErrorCode.BadRequestError));
  }

  // Handle updates
  const updatedCategories = categoriesToUpdate.map((category) => {
    const updateCategory: Category = {
      ...category,
      restaurant,
    };
    return updateCategory;
  });

  // Handle new categories
  const createdCategories = newCategories.map((category) => {
    const newCategory = categoryService.createCategory({
      ...category,
      restaurant,
    });
    return newCategory;
  });

  await categoryService.saveCategories(
    updatedCategories.concat(createdCategories)
  );

  const categoriesUpdated = await categoryService.getActiveCategories(
    restaurant
  );
  res.json(categoriesUpdated);
}

export async function getActiveCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const restaurant: Restaurant = res.locals.user.restaurant;
  console.log(restaurant, 'restaurant');
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
