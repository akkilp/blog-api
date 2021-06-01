import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import RequestWithUser from 'src/authentication/interfaces/requestWithUser.interface';
import { CategoryService } from 'src/categories/categories.service';
import { CreateCategory } from 'src/categories/dto/category.dto';
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

  async create(post: CreatePostDto, { user }: RequestWithUser) {
    const { categories, ...postData } = post;
    let categoryIds = [];

    /* Create categories if existing*/
    if (categories) {
      categoryIds = await this.categoryService.createCategories(categories);
    }

    const postDataWithUser = {
      user,
      categories: categoryIds,
      ...postData,
    };

    const newPost = await this.postsRepository.create(postDataWithUser);
    await this.postsRepository.save(newPost);
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

  async update(id: number, post: UpdatePostDto) {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne(id, {
      relations: ['author'],
    });
    if (!updatedPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return updatedPost;
  }

  async remove(id: number) {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }
}
