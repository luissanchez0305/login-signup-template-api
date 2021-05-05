import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    PassportModule.register({
      property: 'customer',
    }),
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
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
