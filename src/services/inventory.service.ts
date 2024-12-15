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
    let inventory = await this.inventoryRepository.findOne({
      where: { restaurant: { id: restaurant.id } },
    });

    if (!inventory) {
      inventory = this.createInventory({
        restaurant,
        orderCount: 0,
      } as Inventory);

      inventory = await this.saveInventory(inventory);
    }

    return inventory;
  }

  public async incrementOrderCount(restaurant: Restaurant) {
    // First ensure inventory exists
    const inventory = await this.getInventoryByRestaurant(restaurant);

    // Now we can safely increment
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
