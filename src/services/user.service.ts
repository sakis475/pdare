import { In, IsNull, Like, Not, Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { User } from '../database/entity/User.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';
import {
  PaginatedResponse,
  PaginationParams,
  UserType,
} from '../database/interfaces';

export class UserService {
  userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async getUsersByRestaurant(
    restaurant: Restaurant,
    skipOwner = true
  ): Promise<User[]> {
    const whereQuery: any = {
      restaurant: { id: restaurant.id },
    };

    if (skipOwner) {
      whereQuery.role = Not(In([UserType.OWNER]));
    }

    const users = await this.userRepository.find({
      where: whereQuery,
      relations: ['invitations'],
    });

    return users;
  }

  public async getUserByID(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    return user;
  }

  public async getUserByEmail(email: string, getTokens = false) {
    const user = await this.userRepository.findOne({
      where: {
        email,
        active: true,
      },
      relations: ['invitations'],
    });
    return user;
  }

  public async getUserByEmailOrUsername(
    name: string | null,
    email?: string,
    getTokens = false
  ): Promise<User | undefined> {
    const query = this.userRepository.createQueryBuilder('user').select('user');

    // Add password and token if needed
    if (getTokens) {
      query.addSelect(['user.passwordHashed', 'user.token']);
    }

    // Build WHERE conditions based on provided values
    if (email) {
      query.orWhere('user.email = :email', { email });
    }
    if (name) {
      query.orWhere('user.username = :name', { name });
    }

    // If no conditions were added (both null/undefined), search by email as name
    if (!email && !name) {
      query.where('user.email = :email', { email: name });
    }

    // Add eager relations
    query.setFindOptions({
      loadEagerRelations: true,
    });

    return await query.getOne();
  }

  public async getUserByJWT(token: string) {
    const user = await this.userRepository.findOneBy({
      token,
      active: true,
    });
    return user;
  }

  public async saveUser(user: User): Promise<User> {
    if (user.token === null) user = this.clearJWTtoken(user); //if given user not have token it means its edited something else
    return await this.userRepository.save(user);
  }

  public async disableUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  private clearJWTtoken(user: User): User {
    user.token = null;
    return user;
  }
}
