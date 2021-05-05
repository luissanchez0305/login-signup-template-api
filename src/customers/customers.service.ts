import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendGridService } from '@anchan828/nest-sendgrid';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerWalletDto } from './dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private readonly sendGridService: SendGridService,
  ) {}

  async customers(): Promise<CustomerDocument[]> {
    return this.customerModel.find();
  }

  async update(
    _id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    const customer = await this.customerModel
      .findOne({ _id }, '-password')
      .exec();
    if (customer) {
      customer.set(updateCustomerDto);
      await customer.save();
    }
    return customer;
  }

  async createWallet(
    _id: string,
    createCustomerWalletDto: CreateCustomerWalletDto,
  ): Promise<void> {
    const { wallet } = createCustomerWalletDto;
    const customer = await this.findOneById(_id);
    if (customer && customer.wallets) {
      if (customer.wallets.indexOf(wallet) === -1) {
        const wallets = [...customer.wallets, wallet];

        this.customerModel.findOneAndUpdate(
          {
            _id: customer.id,
          },
          {
            wallets,
          },
        );
      }
    }
  }

  async findOneByEmail(email: string): Promise<CustomerDocument> {
    return this.customerModel.findOne({ email });
  }

  async findOneById(_id: string): Promise<CustomerDocument> {
    return this.customerModel.findOne({ _id }, '-password');
  }
}
