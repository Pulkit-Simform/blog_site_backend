import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Post } from 'src/modules/post/entity/posts.entity';
import { User } from 'src/modules/users/entity/users.entity';

@Schema()
@ObjectType()
export class HashTag extends Document {
  @Field()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users' })
  user_id: User;

  @Field(() => [Post])
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Posts' }] })
  post_id: Post[];

  @Field()
  @Prop({
    type: String,
    required: [true, 'HashTag value is required'],
    minlength: 2,
    maxlength: 50,
    unique: true,
  })
  hashtag_text: string;
}

export const HashTagSchema = SchemaFactory.createForClass(HashTag);
