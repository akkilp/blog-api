import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Req,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { forbidUnknownValues } from './util/forbidUnknownValues';
import JwtAuthenticationGuard from 'src/authentication/guards/jwtAuthentication-guard';
import RequestWithUser from 'src/authentication/interfaces/requestWithUser.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  create(
    @Body(new ValidationPipe(forbidUnknownValues))
    createPostData: CreatePostDto,
    @Req() request: RequestWithUser,
  ) {
    return this.postsService.create(createPostData, request);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe(forbidUnknownValues)) updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
