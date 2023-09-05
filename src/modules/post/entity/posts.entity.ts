import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entity/users.entity';
import { Comment } from 'src/modules/comment/entity/comment.entity';
import { HashTag } from 'src/modules/hashtag/entity/hashtag.entity';

@Schema({
  timestamps: true,
})
@ObjectType()
export class Post extends Document {
  @Field()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user_id: User;

  @Field()
  @Prop({
    type: String,
    required: true,
  })
  post_uuid: string;

  @Field()
  @Prop({
    type: String,
    required: [true, 'Post caption required'],
    minlength: 2,
    maxlength: 10000,
  })
  post_caption: string;

  @Field()
  @Prop({
    type: String,
    required: [true, 'Post Image required'],
  })
  post_image: string;

  // meta field of post image
  @Field()
  @Prop({
    type: String,
    required: [true, 'Post Image Key required'],
  })
  post_image_key: string;

  @Field(() => [User])
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  post_likes: User[];

  @Field(() => [Comment])
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comments' }] })
  comments: Comment[];

  @Field(() => [HashTag])
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'HashTags' }] })
  hashtag: HashTag[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
