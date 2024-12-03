import { In, Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Category } from '../database/entity/Category.entity';
import { Restaurant } from '../database/entity/Restaurant.entity';

export class CategoryService {
  categoryRepository: Repository<Category>;
  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  public createCategory(category: Category): Category {
    const newCategory = this.categoryRepository.create(category);

    return newCategory;
  }

  public async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({
      id,
    });

    return category;
  }

  public async getCategoryByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { id: In(ids), restaurant: { id: restaurant.id } },
    });

    return categories;
  }

  public async countCategoryByIds(
    ids: number[],
    restaurant: Restaurant
  ): Promise<Number> {
    const count = await this.categoryRepository.count({
      where: { id: In(ids), restaurant: { id: restaurant.id } },
    });

    return count;
  }

  public async getActiveCategories(
    restaurant: Restaurant
  ): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: {
        restaurant: { id: restaurant.id },
        isEnabled: true,
      },
      order: { orderCategory: 'ASC' },
    });
    return categories;
  }

  public async saveCategory(category: Category) {
    return await this.categoryRepository.save(category);
  }

  public async saveCategories(categories: Category[]) {
    return await this.categoryRepository.save(categories);
  }

  public async deleteCategories(categories: Category[]) {
    return await this.categoryRepository.remove(categories);
  }
}
