import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/mongo/MongooseTestModule';
import { CustomersService } from './customers.service';
import {
  Customer,
  CustomerDocument,
  CustomerSchema,
} from './schemas/customer.schema';
import * as bcrypt from 'bcrypt';
import { SendGridService } from '@anchan828/nest-sendgrid';
import { ConfigModule } from '@nestjs/config';
import {
  CreateCustomerDto,
  CreateCustomerWalletDto,
  UpdateCustomerDto,
} from './dto';
import { Model } from 'mongoose';

describe('CustomersService', () => {
  let service: CustomersService;
  let module: TestingModule;
  let customerModel: Model<CustomerDocument>;
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
      providers: [CustomersService, SendGridService],
    })
      .overrideProvider(SendGridService)
      .useValue(sendGridService)
      .compile();

    service = module.get<CustomersService>(CustomersService);
    customerModel = module.get<Model<CustomerDocument>>(
      `${Customer.name}Model`,
    );
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should return null if customer does not exist', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        name: 'Johnny',
      };
      await expect(
        service.update('603b912aa3784d7e84d6524e', updateCustomerDto),
      ).resolves.toStrictEqual(null);
    });

    it('should update customer', async () => {
      const createCustomerDto: CreateCustomerDto = {
        email: 'customer@example.com',
        password: 'password0123456789',
        name: 'John',
        surname: 'Doe',
        address: 'Main',
        addressTwo: 'Main',
        city: 'Panama',
        province: 'Panama',
        country: 'Panama',
      };
      await customerModel.create(createCustomerDto);
      const customer = await customerModel.findOne({
        email: 'customer@example.com',
      });
      const updateCustomerDto: UpdateCustomerDto = {
        name: 'Johnny',
      };
      await expect(
        service.update(customer.id, updateCustomerDto),
      ).resolves.not.toThrow();
    });
  });

  describe('createWallet', () => {
    it('should return null if customer does not exist', async () => {
      const createCustomerWalletDto: CreateCustomerWalletDto = {
        wallet: '0x39E133e361fcDcBba3cd7d8d9745ec54E4F4b854',
      };
      await expect(
        service.createWallet(
          '603b912aa3784d7e84d6524e',
          createCustomerWalletDto,
        ),
      ).resolves.toStrictEqual(undefined);
    });
    it('should create a wallet for a customer', async () => {
      const customer = await customerModel.findOne({
        email: 'customer@example.com',
      });
      const createCustomerWalletDto: CreateCustomerWalletDto = {
        wallet: '0x39E133e361fcDcBba3cd7d8d9745ec54E4F4b854',
      };
      await expect(
        service.createWallet(customer.id, createCustomerWalletDto),
      ).resolves.toStrictEqual(undefined);
    });

    it('should skip if wallet already exist', async () => {
      const existingCustomer = await customerModel.findOne({
        email: 'customer@example.com',
      });
      const exitistingCustomerWalletDto: CreateCustomerWalletDto = {
        wallet: '0x39E133e361fcDcBba3cd7d8d9745ec54E4F4b854',
      };
      await expect(
        service.createWallet(existingCustomer.id, exitistingCustomerWalletDto),
      ).resolves.toStrictEqual(undefined);
    });
  });

  describe('findOneByEmail', () => {
    it('should return null if customer email does not exist', async () => {
      const email = 'customer999@example.com';
      await expect(service.findOneByEmail(email)).resolves.toStrictEqual(null);
    });

    it('should return customer if email exist', async () => {
      const email = 'customer@example.com';
      await expect(service.findOneByEmail(email)).resolves.not.toThrow();
    });
  });

  describe('findOneById', () => {
    it('should return null if customer does not exist', async () => {
      await expect(
        service.findOneById('603b912aa3784d7e84d6524e'),
      ).resolves.toStrictEqual(null);
    });

    it('should return customer if id exist', async () => {
      const email = 'customer@example.com';
      const customer = await customerModel.findOne({ email }, '-password');
      await expect(service.findOneById(customer.id)).resolves.toStrictEqual(
        customer,
      );
    });
  });
});
