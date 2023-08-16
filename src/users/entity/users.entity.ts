import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as validation from 'validators';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({
  toJSON: {
    getters: true,
  },
  toObject: {
    getters: true,
  },
})
export class User extends Document {
  @Field()
  @Prop({
    type: String,
    required: [true, 'username required'],
    minlength: [5, 'Short length of username, Please provide more characters'],
    maxlength: [
      255,
      'Short length of username, Please provide more characters',
    ],
    unique: true,
  })
  username: string;

  @Field()
  @Prop({
    type: String,
    required: [true, 'email required'],
    unique: true,
    validators: validation.isEmail,
  })
  email: string;

  @Field()
  @Prop({
    type: String,
    required: [true, 'password required'],
    minlength: [8, 'password must be at least 8 characters'],
    maxlength: [100, 'password must be at least 100 characters'],
  })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
