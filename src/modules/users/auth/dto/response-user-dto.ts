import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseUserDto {
  @Field({ nullable: true })
  access_token?: string;
}
