import { getRepository, Repository } from 'typeorm';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { ItemPropertiesPattern } from '../database/entity/ItemPropertiesPattern.entity';
import { AppDataSource } from '../database/dataSource';

export class ItemPropertiesPatternService {
  itemPropertiesPatternRepository: Repository<ItemPropertiesPattern>;

  constructor() {
    this.itemPropertiesPatternRepository = AppDataSource.getRepository(
      ItemPropertiesPattern
    );
  }

  async getEnabledPatterns(
    restaurant: Restaurant
  ): Promise<ItemPropertiesPattern[]> {
    return this.itemPropertiesPatternRepository
      .createQueryBuilder('pattern')
      .leftJoinAndSelect('pattern.category', 'category')
      .where('pattern.restaurant = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .orderBy('pattern.propertyPatternOrder', 'ASC')
      .getMany();
  }

  async getPatternById(
    id: number,
    restaurant: Restaurant
  ): Promise<ItemPropertiesPattern> {
    return this.itemPropertiesPatternRepository
      .createQueryBuilder('pattern')
      .where('pattern.id = :id', { id })
      .andWhere('pattern.restaurant = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .getOne();
  }

  async countPatternsByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<number> {
    return this.itemPropertiesPatternRepository
      .createQueryBuilder('pattern')
      .where('pattern.id IN (:...ids)', { ids })
      .andWhere('pattern.restaurant = :restaurantId', {
        restaurantId: restaurant.id,
      })
      .getCount();
  }

  async savePatterns(
    patterns: ItemPropertiesPattern[]
  ): Promise<ItemPropertiesPattern[]> {
    return this.itemPropertiesPatternRepository.save(patterns);
  }

  async deletePatterns(patternIds: number[]): Promise<void> {
    if (!patternIds?.length) return;

    await this.itemPropertiesPatternRepository.delete(patternIds);
  }
}
