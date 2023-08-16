import { Context, Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { ResponseUserDto } from './dto/response-user-dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@Resolver('auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  private async commonResponseSender(
    data: string,
    res: Response,
  ): Promise<ResponseUserDto> {
    res.cookie('jwt-token', data);
    return {
      access_token: data,
    };
  }

  @Mutation(() => ResponseUserDto)
  async register(
    @Args('createUserInput') user: CreateUserDto,
    @Context('res') res: Response,
  ): Promise<ResponseUserDto> {
    const userCreated = await this.authService.register(user);
    return this.commonResponseSender(userCreated, res);
  }

  @Mutation(() => ResponseUserDto)
  async login(
    @Args('loginUserInput') user: LoginUserDto,
    @Context('res') res: Response,
  ): Promise<ResponseUserDto> {
    const loggedInUser = await this.authService.login(user);
    return this.commonResponseSender(loggedInUser, res);
  }

  @Query(() => ResponseUserDto)
  async logout(@Context('res') res: Response): Promise<ResponseUserDto> {
    return this.commonResponseSender(await this.authService.logout(), res);
  }
}
