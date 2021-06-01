import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './categories.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  findAll() {
    return this.categoryService.getAllCategories();
  }

  @Get(':name')
  findCategories(@Param('name') name: string) {
    return this.categoryService.getCategoryByName(name);
  }
}
