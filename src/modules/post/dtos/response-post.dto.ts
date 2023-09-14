import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponsePostDtos {
  @Field(() => String)
  post_caption: string;

  @Field(() => String)
  post_uuid: string;

  @Field(() => String)
  post_image: string;

  @Field(() => String)
  post_image_key: string;

  @Field(() => [String])
  hashtag: string[];
}

@ObjectType()
export class ResponsePostImageDtos {
  @Field(() => String)
  signedUrl: string;

  @Field(() => String)
  keyName: string;
}
