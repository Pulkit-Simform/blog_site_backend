import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entity/users.entity';
import isEmail from 'validator/lib/isEmail';
import { BadRequestException } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  async findUserByEmail(@Args('email') email: string): Promise<User> {
    if (!isEmail(email)) {
      throw new BadRequestException('Invalid email input');
    }
    return await this.usersService.findUserByEmail(email);
  }

  @Query(() => User)
  async findUserByUsername(@Args('username') username: string): Promise<User> {
    return await this.usersService.findUserByUsername(username);
  }

  @Query(() => [User])
  async getAll(): Promise<User[]> {
    return await this.usersService.getAll();
  }
}
