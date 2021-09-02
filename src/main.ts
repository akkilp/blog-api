import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: true,
  });
  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:8080', credentials: true });

  await app.listen(process.env.PORT as string | 3050);
}
bootstrap();
