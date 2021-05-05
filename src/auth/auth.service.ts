import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthTokensService } from './auth-tokens.service';
import { SendGridService } from '@anchan828/nest-sendgrid';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authTokensService: AuthTokensService,
    private readonly sendGridService: SendGridService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const { password: hashedPassword } = user;
      const passwordsMatch = await bcrypt.compare(password, hashedPassword);
      if (passwordsMatch) {
        return user;
      }
    }
    return null;
  }

  async login(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.authTokensService.generateAccessToken(
      user.id,
    );
    const refreshToken = await this.authTokensService.generateRefreshToken(
      user.id,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const {
      token,
    } = await this.authTokensService.createAccessTokenFromRefreshToken(
      refreshToken,
    );
    return token;
  }
}
