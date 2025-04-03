import { In, Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Item } from '../database/entity/Item.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';
import { groupBy } from 'lodash';
import { Category } from '../database/entity/Category.entity';
import { SortDirection } from '../database/interfaces';

export class ItemService {
  itemRepository: Repository<Item>;
  constructor() {
    this.itemRepository = AppDataSource.getRepository(Item);
  }

  public createItem(item: Item): Item {
    const newItem = this.itemRepository.create(item);

    return newItem;
  }

  public async getItemById(id: number): Promise<Item> {
    const user = await this.itemRepository.findOne({
      where: { id },
      relations: { restaurant: true },
    });

    return user;
  }

  public async getItemByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Item[]> {
    const items = await this.itemRepository.find({
      where: { id: In(ids), restaurant: { id: restaurant.id } },
      relations: { itemProperties: true, category: true },
      order: {
        category: { orderCategory: 'ASC' },
        orderItem: 'ASC',
        itemProperties: { orderGroup: 'ASC', orderItem: 'ASC' },
      },
    });

    return items;
  }

  public async getEnabledItems(
    restaurant: Restaurant,
    category?: Category
  ): Promise<Item[]> {
    const whereQuery = {
      restaurant: { id: restaurant.id },
      // isEnabled: true,
    };

    if (category) {
      Object.assign(whereQuery, { category: { id: category.id } });
    }

    const items = await this.itemRepository.find({
      where: whereQuery,
      relations: { itemProperties: true, category: true },
      order: {
        category: { orderCategory: 'ASC' },
        orderItem: 'ASC',
        itemProperties: { orderGroup: 'ASC', orderItem: 'ASC' },
      },
    });

    const transformedItems = items.map((item) => {
      const { itemProperties, ...rest } = item; // Destructure to exclude itemProperties

      // Add the selected: false key to each itemProperty
      const modifiedItemProperties = itemProperties.filter(
        (property) => property.isEnabled === true
      );

      return {
        ...rest, // Spread all other properties
        itemPropertiesGrouped: groupBy(modifiedItemProperties, 'propertyName'), // Add modified itemProperties
      };
    });

    return transformedItems;
  }

  public async saveItems(items: Item[], dontAllowDoubleTitles = false) {
    if (!items[0]?.restaurant) {
      throw new ErrorException(ErrorCode.BadRequestError);
    }
    if (dontAllowDoubleTitles) {
      const enabledItems = await this.getEnabledItems(items[0].restaurant);

      const hasIntersection = enabledItems.some((enabledItem) =>
        items.some((givenItem) => enabledItem.title === givenItem.title)
      );

      if (hasIntersection) {
        throw new ErrorException(ErrorCode.SQLDuplicate);
      }
    }

    return await this.itemRepository.save(items);
  }

  public async countItemByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Number> {
    const count = await this.itemRepository.count({
      where: { id: In(ids), restaurant: { id: restaurant.id } },
    });

    return count;
  }

  public async getItemCategoryOrderMinMax(
    category: Category,
    restaurant: Restaurant
  ): Promise<{ minOrder: number; maxOrder: number }> {
    const minAndmax = await this.itemRepository
      .createQueryBuilder('item')
      .select('MIN(item."orderItem")', 'minOrder')
      .addSelect('MAX(item."orderItem")', 'maxOrder')
      .where('item.categoryId = :categoryId', { categoryId: category.id })
      .andWhere('item.restaurantId = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .getRawOne();

    return minAndmax;
  }

  public async getItemByOrder(
    category: Category,
    orderItem: number,
    restaurant: Restaurant
  ) {
    const minAndmax = await this.itemRepository
      .createQueryBuilder('item')
      .where('item.categoryId = :categoryId', { categoryId: category.id })
      .andWhere('item.orderItem = :orderItem', { orderItem })
      .andWhere('item.restaurantId = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .getOne();

    return minAndmax;
  }

  public async updateItemOrder(item: Item, sortDirection: SortDirection) {
    const orderNumber = sortDirection === 'sortUp' ? -1 : 1;

    item.orderItem += orderNumber;

    const swapOrderItem = await this.getItemByOrder(
      item.category,
      item.orderItem,
      item.restaurant
    );

    swapOrderItem.orderItem += -1 * orderNumber;

    return await this.itemRepository.save([item, swapOrderItem]);
  }
}
