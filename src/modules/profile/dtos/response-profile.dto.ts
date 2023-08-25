import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseProfileDtos {
  @Field(() => String)
  firstName: string;

  @Field(() => String, { nullable: true })
  middleName?: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  profileImage: string;
}
