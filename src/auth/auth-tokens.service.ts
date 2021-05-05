import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from './refresh-token.service';
import { RefreshTokenDocument } from './schemas/refresh-token.schema';

const accessExpiresIn = process.env.JWT_ACCESS_EXPIRESIN || '5m';
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRESIN || '5d';
const refreshTokenTTL = +process.env.JWT_REFRESH_TOKEN_TTL || 432000;

const BASE_OPTIONS: SignOptions = {
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
};

export interface RefreshTokenPayload {
  jti: string;
  sub: string;
}

@Injectable()
export class AuthTokensService {
  constructor(
    private readonly refreshTokensService: RefreshTokensService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(id: string): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn: accessExpiresIn,
      subject: id,
    };

    return this.jwtService.signAsync({}, opts);
  }

  async generateRefreshToken(id: string): Promise<string> {
    const token = await this.refreshTokensService.create(id, refreshTokenTTL);

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn: refreshExpiresIn,
      subject: id,
      jwtid: token._id.toString(),
    };

    return this.jwtService.signAsync({}, opts);
  }

  async createAccessTokenFromRefreshToken(
    refresh: string,
  ): Promise<{ token: string; user: UserDocument }> {
    const { user } = await this.resolveRefreshToken(refresh);

    const token = await this.generateAccessToken(user._id.toString());

    return { user, token };
  }

  private async resolveRefreshToken(
    encoded: string,
  ): Promise<{ user: UserDocument; token: RefreshTokenDocument }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    if (token.revoked) {
      throw new UnprocessableEntityException('Refresh token revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return { user, token };
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  private async getUserFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<UserDocument> {
    const subId = payload.sub;

    if (!subId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.usersService.findOneById(subId);
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<RefreshTokenDocument | null> {
    const tokenId = payload.jti;

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.refreshTokensService.findTokenById(tokenId);
  }
}
