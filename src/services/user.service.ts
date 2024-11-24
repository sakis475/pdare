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
    });

    return users;
  }

  public async searchUsers(
    searchTerm: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<User>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.restaurant IS NULL')
      .andWhere('user.role = :role', { role: UserType.GUEST });

    if (searchTerm.includes('@')) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `${searchTerm}%`,
      });
    } else {
      queryBuilder.andWhere(
        "(user.username LIKE :searchTerm OR SUBSTRING(user.email, 1, POSITION('@' IN user.email) - 1) LIKE :searchTerm)",
        { searchTerm: `%${searchTerm}%` }
      );
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / pagination.limit);

    const results = await queryBuilder
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getMany();

    return {
      data: results,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  public async getUserByID(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    return user;
  }

  public async getUserByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
        active: true,
      },
    });
    return user;
  }

  public async getUserByEmail(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
      active: true,
    });
    return user;
  }

  public async getUserByEmailOrUsername(
    name: string,
    email?: string,
    getTokens = false
  ): Promise<User | undefined> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :name', { name: email ?? name })
      .orWhere('user.username = :name', { name })
      .setFindOptions({
        loadEagerRelations: true,
      });

    if (getTokens) {
      query.addSelect(['user.passwordHashed', 'user.token']);
    }

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
