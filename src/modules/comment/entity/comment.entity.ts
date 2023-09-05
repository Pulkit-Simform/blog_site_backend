import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Post } from 'src/modules/post/entity/posts.entity';
import { Reply } from 'src/modules/reply/entity/reply.entity';
import { User } from 'src/modules/users/entity/users.entity';

@Schema()
@ObjectType()
export class Comment extends Document {
  @Field(() => User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users' })
  user_id: User;

  @Field(() => Post)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Posts' })
  post_id: Post;

  @Field()
  @Prop({
    type: String,
    required: [true, ' Comment must needed'],
    minlength: 1,
    maxlength: 1000,
  })
  comment_description: string;

  @Field(() => [Reply])
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Replies' }] })
  replies: Reply[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
