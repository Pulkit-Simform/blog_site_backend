import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagResolver } from './hashtag.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { HashTagSchema } from './entity/hashtag.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        schema: HashTagSchema,
        name: 'HashTags',
      },
    ]),
    UsersModule,
    ConfigModule,
  ],
  providers: [
    HashtagService,
    HashtagResolver,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [HashtagService],
})
export class HashtagModule {}
