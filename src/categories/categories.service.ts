import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Category from './entities/category.entity';
import { CreateCategory as CategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllCategories() {
    return this.categoryRepository.find({ relations: ['posts'] });
  }

  /* Create category or increase number of existing one */
  async createCategories(categories: CategoryDto[]) {
    const response = await this.categoryRepository
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values(categories)
      .onConflict(
        `("name") DO UPDATE SET "numberOfPosts" = category."numberOfPosts" + 1`,
      )
      .returning('id')
      .execute();

    /* Returns response in a form of:
     [ { id: 27 }, { id: 28 } ] 
     */
    return response['raw'];
  }

  async getCategoryByName(name: string) {
    const category = await this.categoryRepository.findOne(
      { name },
      {
        relations: ['posts'],
      },
    );
    if (category) {
      return category;
    }
    throw new HttpException('Category does not exist', HttpStatus.NOT_FOUND);
  }
}
