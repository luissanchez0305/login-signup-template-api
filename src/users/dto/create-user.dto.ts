import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(12, {
    message:
      'password must have a minimum length of 12 characters. We highly recommend password managers.',
  })
  password: string;
}
