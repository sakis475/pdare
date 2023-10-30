import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { ItemProperty } from '../database/entity/ItemProperty.entity';

export class ItemPropertyService {
  itemPropertyRepository: Repository<ItemProperty>;
  constructor() {
    this.itemPropertyRepository = AppDataSource.getRepository(ItemProperty);
  }

  public async getItemPropertyById(id: number): Promise<ItemProperty> {
    const itemProperty = await this.itemPropertyRepository.findOneBy({
      id
    });
    return itemProperty;
  }
  public async getItemPropertyByTitle(
    propertyName: string
  ): Promise<ItemProperty> {
    const itemProperty = await this.itemPropertyRepository.findOneBy({
      propertyName
    });
    return itemProperty;
  }

  public async saveItemProperty(itemProperty: ItemProperty) {
    return await this.itemPropertyRepository.save(itemProperty);
  }
}
