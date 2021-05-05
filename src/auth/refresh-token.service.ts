import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshTokenDocument,
  RefreshToken,
} from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async create(userId: string, ttl: number): Promise<RefreshTokenDocument> {
    const token = new this.refreshTokenModel();

    token.user = userId;
    token.revoked = false;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);

    token.expires = expiration;

    return token.save();
  }

  async findTokenById(_id: string): Promise<RefreshTokenDocument | null> {
    return this.refreshTokenModel.findOne({ _id });
  }
}
