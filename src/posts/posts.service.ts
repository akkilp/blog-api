import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import RequestWithUser from '../authentication/interfaces/requestWithUser.interface';
import { CategoryService } from '../categories/categories.service';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(postData: CreatePostDto, { user }: RequestWithUser) {
    const { categories, ...rest } = postData;
    let categoryIds = [];
    if (categories && categories?.length > 0) {
      categoryIds = await this.categoryService.createCategories(categories);
    }

    const postDataWithUser = {
      author: user,
      ...rest,
      categories: categoryIds,
    };

    const newPost = await this.postsRepository.save(postDataWithUser);
    if (categoryIds.length > 0) {
      await this.categoryService.updateCategoryData(categoryIds);
    }
    newPost.author.password = undefined;
    return newPost;
  }

  async findAll() {
    return this.postsRepository.find({ relations: ['author', 'categories'] });
  }

  async findOne(id: number) {
    const targetPost = await this.postsRepository.findOne(id, {
      relations: ['author', 'categories'],
    });
    if (!targetPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return targetPost;
  }

  async update(id: number, postData: UpdatePostDto) {
    const isFound = await this.postsRepository.findOne(id);
    if (!isFound) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const { categories, ...rest } = postData;
    const categoryIds =
      categories?.length > 0
        ? await this.categoryService.createCategories(categories)
        : [];

    const updated = await this.postsRepository.save({
      id,
      ...rest,
      categories: categoryIds,
    });

    await this.categoryService.updateCategoryData(categoryIds);

    return updated;
  }

  async remove(id: number) {
    // Find related categories
    const relatedCategories = await this.postsRepository.findOne(id);

    // Delete posts
    const deleteResponse = await this.postsRepository
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('id = :id', { id })
      .execute();

    if (!deleteResponse.affected) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    // Update data in categories based on array of ids
    // This is used to track number of items in category
    await this.categoryService.updateCategoryData(
      relatedCategories?.categories,
    );
  }
}
