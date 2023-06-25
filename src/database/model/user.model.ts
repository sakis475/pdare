import { Repository } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { User } from '../entity/User';

export class UserModel {
  userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async getUserByID(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id: 1
    });

    return user;
  }

  public async getUserByUsername(username: string) {
    const user = await this.userRepository.findOneBy({
      username
    });
    return user;
  }

  public async saveUser(user: User) {
    return await this.userRepository.save(user);
  }
}
