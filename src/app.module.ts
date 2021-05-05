import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommandModule } from 'nestjs-command';
import { CacheModule, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import * as redisStore from 'cache-manager-ioredis';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { SendGridModule } from '@anchan828/nest-sendgrid';
import Redis from 'ioredis';
import { HttpCacheInterceptor } from './common/http-cache.interceptor';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    CommandModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('THROTTLE_TTL', 60),
        limit: config.get<number>('THROTTLE_LIMIT', 10),
        storage: new ThrottlerStorageRedisService(
          new Redis(
            config.get<number>('REDIS_PORT', 6379),
            config.get<string>('REDIS_HOST', 'localhost'),
            { password: config.get<string>('REDIS_PASSWORD', 'localhost') },
          ),
        ),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        uri: configService.get<string>('MONGODB_CONNECTION_STRING'),
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD'),
        ttl: configService.get<number>('CACHE_TTL', 5),
      }),
    }),
    SendGridModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        apikey: configService.get<string>('SENDGRID_KEY'),
      }),
    }),
    CustomersModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}
