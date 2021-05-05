import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/mongo/MongooseTestModule';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import * as bcrypt from 'bcrypt';
import { SendGridService } from '@anchan828/nest-sendgrid';

describe('CustomersController', () => {
  let controller: CustomersController;
  let module: TestingModule;
  const sendGridService = { send: async () => [] };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          expandVariables: true,
        }),
        rootMongooseTestModule(),
        MongooseModule.forFeatureAsync([
          {
            name: Customer.name,
            useFactory: () => {
              const schema = CustomerSchema;
              schema.pre('save', async function () {
                if (this.isModified('password')) {
                  this.password = await bcrypt.hash(this.password, 10);
                }
              });
              return schema;
            },
          },
        ]),
      ],
      controllers: [CustomersController],
      providers: [CustomersService, SendGridService],
    })
      .overrideProvider(SendGridService)
      .useValue(sendGridService)
      .compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
