import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Comment } from 'src/modules/comment/entity/comment.entity';
import { User } from 'src/modules/users/entity/users.entity';

@Schema()
@ObjectType()
export class Reply extends Document {
  @Field()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users' })
  user_id: User;

  @Field(() => Comment)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comments' })
  comment_id: Comment;

  @Field()
  @Prop({
    type: String,
    required: [true, 'reply must needed'],
    minlength: 1,
    maxlength: 1000,
  })
  reply_text: string;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
