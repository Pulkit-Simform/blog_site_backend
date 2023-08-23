import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { Stream } from 'stream';

/**
 * File upload interface for GraphQL
 */
export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

@InputType()
export class CreateProfileDtos {
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
