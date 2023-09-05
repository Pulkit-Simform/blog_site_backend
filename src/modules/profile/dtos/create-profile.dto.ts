import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { User } from 'src/modules/users/entity/users.entity';
import { FileUpload } from 'src/utils/interfaces/file-upload.interface';

/**
 * File upload interface for GraphQL
 */

// for object body
@InputType({ isAbstract: true })
export class InputProfileDtos {
  @Field()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  firstName: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  middleName?: string;

  @Field()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  lastName: string;

  @Field(() => GraphQLUpload)
  @IsString()
  profileImage: Promise<FileUpload>;
}

@InputType()
export class ImageOnlyProfile {
  @Field(() => GraphQLUpload)
  @IsString()
  profileImage: Promise<FileUpload>;
}

// This is for creating a new profile before it is store in the database
// specifically for db insertion
@ObjectType()
export class CreateProfileDtos {
  @Field()
  user_id: User;

  @Field(() => String)
  firstName: string;

  @Field(() => String, { nullable: true })
  middleName?: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  profileImage: string;

  @Field(() => String)
  profileImageKeyName: string;
}

@InputType()
export class UpdateProfileDtos extends PartialType(InputProfileDtos) {}
