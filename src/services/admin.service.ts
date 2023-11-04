import { User } from '../database/entity/User.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import { UserType } from '../database/interfaces';
import { UserService } from './user.service';
import { RestaurantService } from './restaurant.service';

export class AdminService {
  userService;
  restaurantService;
  constructor() {
    this.userService = new UserService();
    this.restaurantService = new RestaurantService();
  }

  public async createOwnerAndRestaurant(
    ownerUser: Partial<User>,
    restaurant: Partial<Restaurant>
  ) {
    ownerUser.role = UserType.OWNER;

    const newRestaurant = await this.restaurantService.saveRestaurant(
      //@ts-ignore
      restaurant
    );

    ownerUser.restaurant = newRestaurant;

    await this.userService.saveUser(
      //@ts-ignore
      ownerUser
    );
  }
}
