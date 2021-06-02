import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateCategory } from '../../categories/dto/category.dto';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  categories: CreateCategory[];
}
