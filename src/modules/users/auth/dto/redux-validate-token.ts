import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class reduxValidateToken {
  @Field({ nullable: true })
  access_token?: string;

  @Field({ nullable: true, defaultValue: false })
  success: boolean;
}
