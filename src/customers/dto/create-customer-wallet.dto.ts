import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class CreateCustomerWalletDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  wallet: string;
}
