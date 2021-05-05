import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NewslettersModule } from './../src/newsletters/newsletters.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../src/test-utils/mongo/MongooseTestModule';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Newsletter,
  NewsletterSchema,
} from '../src/newsletters/schemas/newsletter.schema';
import { CreateNewsletterDto } from '../src/newsletters/dto/create-newsletter.dto';

const createNewsletterDto: CreateNewsletterDto = {
  email: 'customer@example.com',
};

describe('Newsletters (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: Newsletter.name, schema: NewsletterSchema },
        ]),
        NewslettersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    jest.setTimeout(30000);
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
  });
  it('/newsletters (POST)', () => {
    return request(app.getHttpServer())
      .post('/newsletters')
      .send(createNewsletterDto)
      .expect(HttpStatus.CREATED);
  });
});
