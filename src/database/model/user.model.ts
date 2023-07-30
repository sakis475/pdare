import {
  AfterUpdate,
  BeforeUpdate,
  EntitySubscriberInterface,
  EventSubscriber,
  Repository,
  UpdateEvent,
} from "typeorm";
import { AppDataSource } from "../dataSource";
import { User } from "../entity/User";

export class UserModel {
  userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public async getUserByID(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    return user;
  }

  public async getUserByUsername(username: string) {
    const user = await this.userRepository.findOneBy({
      username,
      active: true,
    });
    return user;
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
