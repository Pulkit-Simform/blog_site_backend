import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Post } from 'src/modules/post/entity/posts.entity';
import { User } from 'src/modules/users/entity/users.entity';

@InputType({ isAbstract: true })
export class InputHashTagDtos {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  hashtag_text: string;
}

@ObjectType()
export class CreateHashTagDtos extends InputHashTagDtos {
  @Field(() => User)
  user_id: User;
}

@InputType()
export class UpdateHashTagDtos extends PartialType(InputHashTagDtos) {
  @Field(() => [Post])
  post_id: Post[];
}
