import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnvVariables } from './util/envValidationSchema';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CategoryModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { HttpLoggerMiddleware } from '@nest-toolbox/http-logger-middleware';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    /*Import env variables through ConfigModule and validate variables with joi */
    ConfigModule.forRoot(validateEnvVariables),
    /* TypeORM module which connects to postgres */
    DatabaseModule,
    CategoryModule,
    PostsModule,
    AuthenticationModule,
    UsersModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
