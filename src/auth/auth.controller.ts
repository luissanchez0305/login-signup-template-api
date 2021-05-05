import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthRefreshDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req): Promise<any> {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  public async refresh(@Body() authRefreshDto: AuthRefreshDto) {
    const accessToken = await this.authService.refreshAccessToken(
      authRefreshDto.refreshToken,
    );

    return {
      accessToken,
    };
  }
}
