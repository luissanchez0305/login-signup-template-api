import { SendGridService } from '@anchan828/nest-sendgrid';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/mongo/MongooseTestModule';
import { AuthTokensService } from './auth-tokens.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokensService } from './refresh-token.service';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;
  const sendGridService = { send: async () => [] };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: true,
          expandVariables: true,
        }),
        rootMongooseTestModule(),
        PassportModule.register({
          usernameField: 'email',
          property: 'customer',
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRES'),
            },
          }),
          inject: [ConfigService],
        }),
        MongooseModule.forFeature([
          { name: RefreshToken.name, schema: RefreshTokenSchema },
        ]),
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
      providers: [
        AuthService,
        AuthTokensService,
        RefreshTokensService,
        SendGridService,
        UsersService,
      ],
      controllers: [AuthController],
    })
      .overrideProvider(SendGridService)
      .useValue(sendGridService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
