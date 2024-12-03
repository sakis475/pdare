import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Restaurant } from '../database/entity/Restaurant.entity';

export class RestaurantService {
  restaurantRepository: Repository<Restaurant>;
  constructor() {
    this.restaurantRepository = AppDataSource.getRepository(Restaurant);
  }

  public createRestaurant(restaurant: Restaurant) {
    return this.restaurantRepository.create(restaurant);
  }
  public async getRestaurantById(id: number): Promise<Restaurant> {
    const user = await this.restaurantRepository.findOneBy({
      id,
    });

    return user;
  }

  public async getRestaurantByName(name: string): Promise<Restaurant> {
    const user = await this.restaurantRepository.findOneBy({
      restaurantName: name,
    });

    return user;
  }

  public async saveRestaurant(restaurant: Restaurant) {
    return await this.restaurantRepository.save(restaurant);
  }
}
