import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ResponseUserDto } from './dto/response-user-dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(
      password,
      await bcrypt.genSalt(
        parseInt(this.configService.get('BCRYPT_SALT_ROUNDS')),
      ),
    );
  }

  async register(user: CreateUserDto): Promise<string> {
    if (await this.usersService.findUserByEmail(user.email))
      throw new BadRequestException('User already registered');

    if (await this.usersService.findUserByUsername(user.username)) {
      throw new BadRequestException('User already registered');
    }

    const userCreated = await this.usersService.create({
      ...user,
      password: await this.hashPassword(user.password),
    });

    return await this.jwtService.sign({ id: userCreated._id });
  }

  async login(user: LoginUserDto): Promise<string> {
    const availableUser = await this.usersService.findUserByUsername(
      user.username,
    );

    if (!availableUser) {
      throw new BadRequestException('username or password is invalid');
    }

    const checkPassword = await bcrypt.compare(
      user.password,
      availableUser.password,
    );

    if (!checkPassword) {
      throw new BadRequestException('username or password is invalid');
    }

    return await this.jwtService.sign({ id: availableUser._id });
  }

  async logout(): Promise<undefined> {
    return undefined;
  }
}
