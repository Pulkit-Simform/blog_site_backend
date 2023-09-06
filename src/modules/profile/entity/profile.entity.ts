import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entity/users.entity';

@Schema({
  timestamps: true,
})
@ObjectType()
export class Profile extends Document {
  @Field()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user_id: User;

  @Field(() => String)
  @Prop({
    type: String,
    required: [true, 'First name should be required'],
    maxlength: 255,
    minlength: 1,
  })
  firstName: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    maxlength: 255,
    minlength: 1,
  })
  middleName?: string;

  @Field()
  @Prop({
    type: String,
    required: [true, 'last name should be required'],
    maxlength: 255,
    minlength: 1,
  })
  lastName: string;

  @Field()
  @Prop({
    type: String,
    required: [true, 'profile image should be required'],
  })
  profileImage: string;

  @Field({ nullable: true })
  @Prop({
    type: String,
    required: [true, 'profile image key name should be required'],
  })
  profileImageKeyName?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
