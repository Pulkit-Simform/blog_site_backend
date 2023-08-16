import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
@ObjectType()
export class Profile extends Document {
  @Field()
  @Prop()
  firstName: string;

  @Field()
  @Prop()
  middleName: string;

  @Field()
  @Prop()
  surname: string;
}
