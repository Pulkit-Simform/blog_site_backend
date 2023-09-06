import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './entity/posts.entity';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { HashtagModule } from '../hashtag/hashtag.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Posts',
        schema: PostSchema,
      },
    ]),
    HashtagModule,
    ConfigModule,
    UsersModule,
    JwtModule,
  ],
  providers: [PostResolver, PostService],
})
export class PostModule {}
