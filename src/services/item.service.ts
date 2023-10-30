import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Item } from '../database/entity/Item.entity';

export class ItemService {
  itemRepository: Repository<Item>;
  constructor() {
    this.itemRepository = AppDataSource.getRepository(Item);
  }

  public async getItemById(id: number): Promise<Item> {
    const item = await this.itemRepository.findOneBy({
      id
    });

    return item;
  }
  public async getItemByTitle(title: string): Promise<Item> {
    const item = await this.itemRepository.findOneBy({
      title
    });

    return item;
  }

  public async saveItem(item: Item) {
    return await this.itemRepository.save(item);
  }
}
