import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { HashTag } from 'src/modules/hashtag/entity/hashtag.entity';
import { User } from 'src/modules/users/entity/users.entity';
import { FileUpload } from 'src/utils/interfaces/file-upload.interface';

@InputType({ isAbstract: true })
export class InputPostDtos {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(10000)
  post_caption: string;

  @Field(() => GraphQLUpload)
  @IsString()
  post_image: Promise<FileUpload>;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  hashtag: string[];
}

/**
 * TODO: [1] Pending from here after HashTag service
 */
@ObjectType()
export class CreatePostDtos {
  @Field(() => User)
  user_id: User;

  @Field(() => String)
  post_caption: string;

  @Field(() => String)
  post_uuid: string;

  @Field(() => String)
  post_image: string;

  @Field(() => String)
  post_image_key: string;

  @Field(() => [HashTag])
  hashtag: HashTag[];
}

@InputType()
export class UpdatePostDtos extends PartialType(InputPostDtos) {}
