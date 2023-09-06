import { Field, ObjectType } from '@nestjs/graphql';
// import { Comment } from 'src/modules/comment/entity/comment.entity';
// import { User } from 'src/modules/users/entity/users.entity';

@ObjectType()
export class GetPostDtos {
  @Field(() => String)
  post_uuid: string;

  @Field(() => String)
  post_image: string;

  @Field(() => String)
  post_caption: string;

  @Field(() => [String])
  hashtag: string[];

  //   post_likes: User[];
  //   comments: Comment[];
}
