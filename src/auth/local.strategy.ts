import { Strategy } from 'passport-local';
import { AuthModuleOptions, PassportStrategy } from '@nestjs/passport';
import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    @Optional() options: AuthModuleOptions,
  ) {
    super(options);
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
