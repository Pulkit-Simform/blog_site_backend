import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/modules/post/entity/posts.entity';

@ObjectType()
export class TagRelatedPostsDtos {
  @Field(() => String)
  hashtag_text: string;

  @Field(() => [Post])
  posts: Post[];
}
