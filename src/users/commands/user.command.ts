import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class UserCommand {
  constructor(private readonly usersService: UsersService) {}

  @Command({
    command: 'create:user <email> <password>',
    describe: 'create a user',
    autoExit: true,
  })
  async create(
    @Positional({
      name: 'email',
      describe: 'the users email address',
      type: 'string',
    })
    email: string,
    @Positional({
      name: 'password',
      describe: 'the users password',
      type: 'string',
    })
    password: string,
  ) {
    await this.usersService.create({
      email,
      password,
    });
  }
}
