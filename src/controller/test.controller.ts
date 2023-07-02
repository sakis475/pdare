import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { comparePassword } from '../auth/password-hash';
import { generateAuthToken } from '../auth/jwt';
import { UserModel } from '../database/model/user.model';
import { User } from '../database/entity/User';
import { PropertyDataType, UserType } from '../database/interfaces';
import { CategoryModel } from '../database/model/category.model';
import { ItemModel } from '../database/model/item.model';
import { ItemPropertyModel } from '../database/model/itemProperty.model';
import { AppDataSource } from 'src/database/dataSource';
import { OrderModel } from '../database/model/order.model';
import { OrderItemModel } from '../database/model/orderItem.model';
import { OrderItem } from '../database/entity/OrderItem';

//clients needs the REGISTER_AUTH_TOKEN to add it as a parameter of the URI
export async function populateData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userModel = new UserModel();

  try {
    await userModel.saveUser({
      username: 'sakis',
      firstName: 'thanos',
      lastName: 'pip',
      role: UserType.ADMIN,
      passwordHashed: 'asd'
    });
  } catch (error) {}

  const user = await userModel.getUserByUsername('sakis');

  const categoryModel = new CategoryModel();
  await categoryModel.saveCategory({
    title: 'Coffee'
  });
  await categoryModel.saveCategory({
    title: 'Tea'
  });
  await categoryModel.saveCategory({
    title: 'Bevarage'
  });

  const itemPropertyModel = new ItemPropertyModel();

  const itemProperty = await itemPropertyModel.saveItemProperty({
    title: 'sugar',
    dataType: PropertyDataType.SINGLESELECT,
    values: ['Sketos', 'Metrios', 'Glikos']
  });

  const itemModel = new ItemModel();

  const coffeeCategory = await categoryModel.getCategoryById(1);

  const item = await itemModel.saveItem({
    title: 'Espresso',
    category: coffeeCategory,
    itemProperty: [itemProperty]
  });

  const orderModel = new OrderModel();

  const order = await orderModel.saveOrder({
    user: user
  });

  const orderItemModel = new OrderItemModel();

  const orderItem = await orderItemModel.saveOrderItem({
    order: order,
    item: item,
    itemProperties: ['Sketos'],
    quantity: 2
  });

  res.json('ok');
}
