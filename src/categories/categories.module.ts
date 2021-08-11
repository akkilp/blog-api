import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './categories.controller';

import { CategoryService } from './categories.service';
import Category from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  exports: [CategoryService],
  providers: [CategoryService],
})
export class CategoryModule {}
