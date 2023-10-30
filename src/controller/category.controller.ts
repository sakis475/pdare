import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { comparePassword, passwordHash } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserService } from '../services/user.service';
import { ErrorException } from '../error_handler/error-exception';
import { UserType } from '../database/interfaces';
import { User } from '../database/entity/User.entity';
import { CategoryService } from '../services/category.service';

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
