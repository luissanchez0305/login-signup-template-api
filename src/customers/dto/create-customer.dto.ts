import { IsNotEmpty, IsEmail, IsOptional, MinLength } from 'class-validator';
export class CreateCustomerDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(12, {
    message:
      'password must have a minimum length of 12 characters. We highly recommend password managers.',
  })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  surname: string;

  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  address: string;

  @IsOptional()
  addressTwo: string;

  @IsNotEmpty()
  province: string;

  @IsNotEmpty()
  city: string;
}
