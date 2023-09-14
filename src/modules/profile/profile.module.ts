import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthModule } from '../users/auth/auth.module';
import { ProfileSchema } from './entity/profile.entity';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

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
  providers: [ProfileService, ProfileResolver, JwtService, ConfigService],
})
export class ProfileModule {}
