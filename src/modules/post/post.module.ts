import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './entity/posts.entity';
import { PostResolver } from './post.resolver';
import { PostService } from './services/post.service';
import { HashtagModule } from '../hashtag/hashtag.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { UploadPostService } from './services/upload-post.service';

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
  providers: [PostResolver, PostService, UploadPostService],
})
export class PostModule {}
