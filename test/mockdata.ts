import { CreatePostDto } from 'src/posts/dto/create-post.dto';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';
import RegisterDto from 'src/authentication/dto/register.dto';

export const createPostData: CreatePostDto = {
  title: 'title',
  content: 'content',
  categories: [
    { name: 'category1' },
    { name: 'category2' },
    { name: 'category3' },
  ],
};

export const updatedPostData: UpdatePostDto = {
  title: 'title is new',
  categories: [
    { name: 'category1' },
    { name: 'category3' },
    { name: 'newCategory' },
  ],
};

export const invalidRegisterData = {
  email: 'wrongformat',
  name: 'Jarkko',
  password: 'jarkonsalasana',
  adminPassword: 'SECRETPASSWORD',
  notExpected: 'raiseError',
};

export const wrongAdminPassword: RegisterDto = {
  email: 'email@email.com',
  name: 'Jarkko',
  password: 'jarkonsalasana',
  adminPassword: 'wrongpassword',
};

export const registerData: RegisterDto = {
  email: 'email@email.com',
  name: 'Jarkko',
  password: 'jarkonsalasana',
  adminPassword: '',
};
