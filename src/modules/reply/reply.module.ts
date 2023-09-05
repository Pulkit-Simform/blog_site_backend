import { Module } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { ReplyResolver } from './reply.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplySchema } from './entity/reply.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Replies',
        schema: ReplySchema,
      },
    ]),
  ],
  providers: [ReplyService, ReplyResolver],
})
export class ReplyModule {}
