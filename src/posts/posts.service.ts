import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  private lastPostId = 0;
  private posts: Post[] = [];

  create(post: CreatePostDto) {
    const newPost = {
      id: ++this.lastPostId,
      ...post,
    };
    console.log(newPost);
    this.posts.push(newPost);
    return newPost;
  }

  findAll() {
    return this.posts;
  }

  findOne(id: number) {
    const targetPost = this.posts.find((post) => post.id === id);
    if (!targetPost) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return targetPost;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex > -1) {
      const updatedPosts = [
        ...this.posts,
        (this.posts[postIndex] = {
          ...this.posts[postIndex],
          ...updatePostDto,
        }),
      ];
      this.posts = updatedPosts;
      return this.posts[postIndex];
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  remove(id: number) {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex > -1) {
      this.posts.splice(postIndex, 1);
      return HttpStatus.OK;
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }
}
