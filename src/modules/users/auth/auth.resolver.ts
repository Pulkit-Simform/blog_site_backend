import { Context, Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { ResponseUserDto } from './dto/response-user-dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Response, Request } from 'express';
import { reduxValidateToken } from './dto/redux-validate-token';
import { BadRequestException } from '@nestjs/common';

@Resolver('auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * @param data {string}
   * @param res {Response}
   *
   * returns {
   *    access_token: string
   * }
   */
  private async commonResponseSender(
    data: string,
    res: Response,
  ): Promise<ResponseUserDto> {
    res.cookie('jwt-token', data, { httpOnly: true });
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

  @Query(() => Boolean)
  async logout(
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<boolean> {
    const token = req.cookies['jwt-token'];

    if (!token) {
      throw new BadRequestException('Either cookie has expired or invalid.');
    }

    if (!(await this.authService.validateUser(token))) {
      throw new BadRequestException('Cookie is not valid.');
    }

    res.cookie('jwt-token', null, {
      maxAge: 0,
    });

    return true;
  }

  @Query(() => reduxValidateToken)
  async validateUser(
    @Context('req') req: Request,
  ): Promise<reduxValidateToken> {
    const token = req.cookies['jwt-token'];
    if (!token) {
      throw new BadRequestException('Either cookie has expired or invalid.');
    }
    return {
      access_token: token,
      success: await this.authService.validateUser(token),
    };
  }
}
