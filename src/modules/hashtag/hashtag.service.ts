import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InputHashTagDtos, UpdateHashTagDtos } from './dtos/create-hashtag.dto';
import { HashTag } from './entity/hashtag.entity';

@Injectable()
export class HashtagService {
  constructor(
    @InjectModel('HashTags') private readonly hashTagModel: Model<HashTag>,
  ) {}

  async getTagByIds(id: string): Promise<HashTag> {
    return await this.hashTagModel.findById(id);
  }

  async getTag(hashtag_text: string): Promise<HashTag> {
    return await this.hashTagModel.findOne({ hashtag_text });
  }

  async createTag(tag: InputHashTagDtos, context: any): Promise<HashTag> {
    return await this.hashTagModel.create({
      ...tag,
      user_id: context.res.locals.user_id,
    });
  }

  // FIXME: Somehow update
  // For post tags only
  async updateTagForPost(
    id: string,
    updateTagId: UpdateHashTagDtos,
  ): Promise<HashTag> {
    return await this.hashTagModel.findByIdAndUpdate(id, {
      $push: { post_id: updateTagId },
    });
  }
}
