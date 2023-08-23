import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entity/users.entity';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('Users') private readonly userModel: Model<User>) {}

  async create(user: CreateUserDto): Promise<User> {
    return await this.userModel.create(user);
  }

  async findUserById(userId: string): Promise<User> {
    return await this.userModel.findById(userId);
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({
      email,
    });
  }

  async findUserByUsername(username: string): Promise<User> {
    return await this.userModel.findOne({ username });
  }

  async getAll(): Promise<User[]> {
    return await this.userModel.find();
  }
}
