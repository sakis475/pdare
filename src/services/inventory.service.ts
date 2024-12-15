import { In, Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Inventory } from '../database/entity/Inventory.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';

export class InventoryService {
  inventoryRepository: Repository<Inventory>;
  constructor() {
    this.inventoryRepository = AppDataSource.getRepository(Inventory);
  }

  public createInventory(inventory: Inventory): Inventory {
    const newInventory = this.inventoryRepository.create(inventory);

    return newInventory;
  }

  public async getInventoryByRestaurant(restaurant: Restaurant) {
    return await this.inventoryRepository.findOne({
      where: { restaurant: { id: restaurant.id } },
    });
  }

  public async incrementOrderCount(restaurant: Restaurant) {
    await this.inventoryRepository.increment(
      { restaurant: { id: restaurant.id } },
      'orderCount',
      1
    );
  }

  public async saveInventory(inventory: Inventory) {
    return await this.inventoryRepository.save(inventory);
  }
}
