import { In, Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Item } from '../database/entity/Item.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { ErrorCode } from '../error_handler/error-code';
import { ErrorException } from '../error_handler/error-exception';

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
    const user = await this.itemRepository.findOneBy({
      id
    });

    return user;
  }

  public async getItemByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Item[]> {
    const categories = await this.itemRepository.find({
      where: { id: In(ids), restaurant }
    });

    return categories;
  }

  public async getEnabledItems(restaurant: Restaurant): Promise<Item[]> {
    const items = await this.itemRepository.find({
      where: { restaurant, isEnabled: true }
    });
    return items;
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
      where: { id: In(ids), restaurant }
    });

    return count;
  }
}
