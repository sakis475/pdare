import { Repository } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { ItemProperty } from '../entity/ItemProperty';

export class ItemPropertyModel {
  itemPropertyRepository: Repository<ItemProperty>;
  constructor() {
    this.itemPropertyRepository = AppDataSource.getRepository(ItemProperty);
  }

  public async getItemPropertyById(id: number): Promise<ItemProperty> {
    const user = await this.itemPropertyRepository.findOneBy({
      id
    });
    return user;
  }

  public async saveItemProperty(itemProperty: ItemProperty) {
    return await this.itemPropertyRepository.save(itemProperty);
  }
}
