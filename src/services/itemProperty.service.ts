import { In, Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { ItemProperty } from '../database/entity/ItemProperty.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';

export class ItemPropertyService {
  itemPropertyRepository: Repository<ItemProperty>;
  constructor() {
    this.itemPropertyRepository = AppDataSource.getRepository(ItemProperty);
  }

  public create(itemProperty: ItemProperty[]): ItemProperty[] {
    const newItemProperty = this.itemPropertyRepository.create(itemProperty);
    return newItemProperty;
  }

  public async getItemPropertyById(id: number): Promise<ItemProperty> {
    const itemProperty = await this.itemPropertyRepository.findOneBy({
      id
    });
    return itemProperty;
  }

  public async getItemPropertyByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<ItemProperty[]> {
    const itemProperties = await this.itemPropertyRepository.find({
      where: { id: In(ids), restaurant }
    });
    return itemProperties;
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

  public async countItemPropertiesByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Number> {
    const count = await this.itemPropertyRepository.count({
      where: { id: In(ids), restaurant }
    });

    return count;
  }
}
