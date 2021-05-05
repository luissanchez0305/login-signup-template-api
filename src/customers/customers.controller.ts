import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto, CreateCustomerWalletDto } from './dto';
import { CustomerDocument } from './schemas/customer.schema';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async index(): Promise<CustomerDocument[]> {
    return this.customersService.customers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CustomerDocument> {
    return this.customersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateMe(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/wallets')
  async addWallet(
    @Param('id') id: string,
    @Body() createCustomerWalletDto: CreateCustomerWalletDto,
  ): Promise<void> {
    this.customersService.createWallet(id, createCustomerWalletDto);
  }
}
