import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnvVariables } from './util/envValidationSchema';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    PostsModule,
    /*Import env variables through ConfigModule and validate variables with joi */
    ConfigModule.forRoot(validateEnvVariables),
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
