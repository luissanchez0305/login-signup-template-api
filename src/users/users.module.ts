import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserCommand } from './commands/user.command';

@Module({
  imports: [
    CommandModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;
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
  controllers: [UsersController],
  providers: [UserCommand, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
