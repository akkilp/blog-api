import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from '../authentication/guards/jwtAuthentication-guard';
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

  @UseGuards(JwtAuthenticationGuard)
  @Delete(':category')
  deleteCategory(@Param('category') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
