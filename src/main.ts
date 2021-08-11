import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: true,
  });
  app.use(cookieParser());
  app.enableCors({
    origin: 'https://blog-client-flt2phf46-akkilp.vercel.app/',
    credentials: true,
  });
  await app.listen(process.env.PORT || 3050);
}
bootstrap();
