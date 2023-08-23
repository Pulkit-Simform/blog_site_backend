import { Injectable } from '@nestjs/common';
import { CreateProfileDtos } from './dtos/create-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './entity/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel('Profiles') private readonly profileModel: Model<Profile>,
  ) {}

  async createProfile(data: CreateProfileDtos): Promise<any> {
    return await this.profileModel.create(data);
  }
}
