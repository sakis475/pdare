import { Repository } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { Item } from '../entity/Item';

export class ItemModel {
  itemRepository: Repository<Item>;
  constructor() {
    this.itemRepository = AppDataSource.getRepository(Item);
  }

  public async getItemById(id: number): Promise<Item> {
    const user = await this.itemRepository.findOneBy({
      id
    });

    return user;
  }

  public async saveItem(item: Item) {
    return await this.itemRepository.save(item);
  }
}
