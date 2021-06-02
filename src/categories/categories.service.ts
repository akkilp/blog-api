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

  /* Create categories if not existing*/
  async createCategories(categories: CategoryDto[]) {
    const response = await this.categoryRepository
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values(categories)
      .onConflict(`("name") DO UPDATE SET name=EXCLUDED."name"`)
      .returning(['id', 'name'])
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

  async getCategoryById(id: number) {
    const category = await this.categoryRepository.findOne(id, {
      relations: ['posts'],
    });
    if (category) {
      return category;
    }
    throw new HttpException('Category does not exist', HttpStatus.NOT_FOUND);
  }

  async deleteCategory(id: number) {
    const deleteResponse = await this.categoryRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Category does not exist', HttpStatus.NOT_FOUND);
    }
    this.updateCategoryData([{ id }]);
  }

  /* Update amount of blogposts in category  */
  async updateCategoryData(categoryArr: any) {
    const categories = await this.getAllCategories();
    const idArr = categoryArr.map((category) => category.id);

    const updatedData = categories.reduce((array, current) => {
      return array.concat({ id: current.id, amount: current.posts.length });
    }, []);

    const targets = updatedData.filter((item) => idArr.includes(item.id));

    await Promise.all(
      targets.map(
        async (target) =>
          await this.categoryRepository.save({
            id: target.id,
            numberOfPosts: target.amount,
          }),
      ),
    );
  }
}
