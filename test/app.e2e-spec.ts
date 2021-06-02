import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as mockData from './mockdata';
import * as cookieParser from 'cookie-parser';

describe('E2E tests for the application', () => {
  let app: INestApplication;
  let service: ConfigService;
  let cookie;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [ConfigService],
    }).compile();

    service = moduleFixture.get<ConfigService>(ConfigService);
    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });
  describe('Unauthenticated users have permission to blog contents', () => {
    it('/posts (GET) returns 200 with empty array', async () => {
      return request(app.getHttpServer()).get('/posts').expect(200).expect([]);
    });
    it('/posts/:id (GET) authorized, but not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/posts/1')
        .expect(404);

      expect(response.body.message).toBe('Post not found');
    });
    it('/categories (GET) returns 200 with empty array', async () => {
      return request(app.getHttpServer())
        .get('/categories')
        .expect(200)
        .expect([]);
    });
    it('/categories/:name (GET) authorized, but not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/1')
        .expect(404);

      expect(response.body.message).toBe('Category does not exist');
    });
  });

  describe('Unauthenticated users are blocked from secure api endpoints', () => {
    it('/posts (POST) unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts')
        .send(mockData.createPostData)
        .expect(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('/posts/:id (PATCH) unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .patch('/posts/1')
        .send(mockData.createPostData)
        .expect(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('/posts/:id (DELETE) unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .delete('/posts/1')
        .send(mockData.createPostData)
        .expect(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('/users (GET) unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('/authentication (GET) unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .get('/authentication')
        .expect(401);
      expect(response.body.message).toBe('Unauthorized');
    });

    it('/categories:/id (DELETE) unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .delete('/categories/1')
        .expect(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Registration', () => {
    it('/authentication/register (POST) Register fails with unvalidated data', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/register')
        .send(mockData.invalidRegisterData)
        .expect(400);
      expect(response.body.message).toStrictEqual([
        'property notExpected should not exist',
        'email must be an email',
      ]);
    });

    it('/authentication/register (POST) Register fails with wrong admin password', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/register')
        .send(mockData.wrongAdminPassword)
        .expect(403);
      expect(response.body.message).toBe('Invalid admin password');
    });

    it('/authentication/register (POST) Register works with proper admin password and data', async () => {
      const adminPassword = service.get('ADMIN_PASSWORD');
      const registerData = { ...mockData.registerData, adminPassword };

      const response = await request(app.getHttpServer())
        .post('/authentication/register')
        .send(registerData)
        .expect(201);
      expect(response.body.password).not.toBeDefined();
      expect(response.body.adminPassword).not.toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(registerData.email);
      expect(response.body.name).toBe(registerData.name);
    });

    it('/authentication/register (POST) duplicate email throws an error', async () => {
      const adminPassword = service.get('ADMIN_PASSWORD');
      const registerData = { ...mockData.registerData, adminPassword };

      const response = await request(app.getHttpServer())
        .post('/authentication/register')
        .send(registerData)
        .expect(400);
      expect(response.body.message).toBe('User with that email already exists');
    });
  });

  describe('Login, logout, cookies', () => {
    it('/authentication/login (POST) Login fails with invalid password', async () => {
      const wrongPassword = mockData.registerData.password.toUpperCase();
      const invalidCredentials = {
        ...mockData.registerData,
        password: wrongPassword,
      };
      const response = await request(app.getHttpServer())
        .post('/authentication/login')
        .send(invalidCredentials)
        .expect(400);
      expect(response.header).not.toHaveProperty('set-cookie');
    });

    it('/authentication/login (POST) Login works and creates cookie succesfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/login')
        .send(mockData.registerData)
        .expect(200);
      expect(response.header).toHaveProperty('set-cookie');

      /* Parses cookie, which is in form:
        Authentication=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYyMjY0MDk4NSwiZXhwIjoxNjIyNjQxNTg1fQ.7_t7wfbvqy0jVxVXN7QvhDotF3WsLWZd5EwO_7f5VLM; HttpOnly; Path=/; Max-Age=600
        */
      const authenticationRegexr = /(?<=Authentication=).*(?=; Http)/;
      cookie = response.header['set-cookie'][0];
      const authenticationCookie = cookie.match(authenticationRegexr)[0];
      expect(authenticationCookie.length).toBeGreaterThan(0);
    });

    it('/authentication (GET) Logged in user is identified', async () => {
      const response = await request(app.getHttpServer())
        .get('/authentication')
        .set('Cookie', cookie)
        .expect(200);
      expect(response.body.email).toBe(mockData.registerData.email);
      expect(response.body.name).toBe(mockData.registerData.name);
      expect(response.body.id).toBeDefined();
    });

    it('/authentication/logout (POST) User is able to log out, and cookie is cleared', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/logout')
        .set('Cookie', cookie)
        .expect(200);

      expect(response.header).toHaveProperty('set-cookie');
      expect(response.header['set-cookie'][0]).toBe(
        'Authentication=; HttpOnly; Path=/; Max-Age=0',
      );
    });

    describe('Functionality for authenticated users', () => {
      it('/posts (POST) User is able to create posts', async () => {
        const response = await request(app.getHttpServer())
          .post('/posts')
          .set('Cookie', cookie)
          .send(mockData.createPostData)
          .expect(201);

        expect(response.body.content).toBe(mockData.createPostData.content);
        expect(response.body.title).toBe(mockData.createPostData.title);
        expect(response.body.author.email).toBe(mockData.registerData.email);
        expect(response.body.author.name).toBe(mockData.registerData.name);
        expect(response.body.categories.length).toBe(
          mockData.createPostData.categories.length,
        );
      });

      it('/post/:id (GET) Created post data is correct', async () => {
        const validCategories = [
          { id: 1, name: 'category1', numberOfPosts: 1 },
          { id: 2, name: 'category2', numberOfPosts: 1 },
          { id: 3, name: 'category3', numberOfPosts: 1 },
        ];

        const response = await request(app.getHttpServer())
          .get('/posts/1')
          .expect(200);
        expect(response.body.content).toBe(mockData.createPostData.content);
        expect(response.body.title).toBe(mockData.createPostData.title);
        expect(response.body.author.email).toBe(mockData.registerData.email);
        expect(response.body.author.name).toBe(mockData.registerData.name);
        expect(response.body.categories.length).toBe(
          mockData.createPostData.categories.length,
        );
        expect(response.body.categories).toEqual(validCategories);
      });

      it('/posts/:id (PATCH) User is able to update posts', async () => {
        const response = await request(app.getHttpServer())
          .patch('/posts/1')
          .set('Cookie', cookie)
          .send(mockData.updatedPostData)
          .expect(200);

        expect(response.body.content).toBe(mockData.createPostData.content);
        expect(response.body.title).toBe(mockData.updatedPostData.title);
        expect(response.body.author.email).toBe(mockData.registerData.email);
        expect(response.body.author.name).toBe(mockData.registerData.name);
        const findNewCategory = response.body.categories.filter(
          (category) => category.name === 'newCategory',
        );
        expect(findNewCategory.length).toBeGreaterThan(0);
        const findOldCategory = response.body.categories.filter(
          (category) => category.name === 'category2',
        );
        expect(findOldCategory.length).not.toBeGreaterThan(0);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
