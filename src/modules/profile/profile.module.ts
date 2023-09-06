import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { UsersModule } from 'src/modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../users/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileSchema } from './entity/profile.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Profiles',
        schema: ProfileSchema,
      },
    ]),
    UsersModule,
    ConfigModule,
    AuthModule,
  ],
  providers: [
    ProfileService,
    ProfileResolver,
    JwtService,
    ConfigService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class ProfileModule {}
