import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;
}
