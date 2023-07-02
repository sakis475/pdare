import { Repository } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { Category } from '../entity/Category';

export class CategoryModel {
  categoryRepository: Repository<Category>;
  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  public async getCategoryById(id: number): Promise<Category> {
    const user = await this.categoryRepository.findOneBy({
      id
    });

    return user;
  }

  public async saveCategory(Category: Category) {
    return await this.categoryRepository.save(Category);
  }
}
