import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastify from 'fastify';
import { AppModule } from './app.module';
import { Logger } from './core';

const logger: Logger = new Logger('main');

const corsOptions = (configService: ConfigService): CorsOptions => {
  const originUrlsEnv = configService.get<string>('CORS_ORIGIN_URLS', '');
  const exposedHeadersEnv = configService.get<string>(
    'CORS_EXPOSED_HEADERS',
    '',
  );
  const origin = originUrlsEnv.split(',');
  const exposedHeaders = exposedHeadersEnv.split(',');
  const maxAge = configService.get<number>('CORS_MAX_AGE', 300);
  return { origin: 'http://localhost:3010', exposedHeaders, maxAge, credentials: true };
};

async function bootstrap() {
  const fastifyIntance = fastify({
    logger: logger.getPINO(),
    trustProxy: true,
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyIntance),
  );

  const configService = app.get(ConfigService);

  app.enableCors(corsOptions(configService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT');
  await app.listen(port, '0.0.0.0');
}
bootstrap();
