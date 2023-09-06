import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InputHashTagDtos, UpdateHashTagDtos } from './dtos/create-hashtag.dto';
import { HashTag } from './entity/hashtag.entity';
import { TagRelatedPostsDtos } from './dtos/tagRelatedPost.dto';

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

  async tagRelatedPost(tag: string): Promise<TagRelatedPostsDtos[]> {
    const pipeline = [
      {
        $match: { hashtag_text: tag },
      },
      {
        $lookup: {
          from: 'posts',
          foreignField: '_id',
          localField: 'post_id',
          as: 'posts',
        },
      },
    ];

    const tags = await this.hashTagModel.aggregate(pipeline);
    return tags;
  }

  // creating general tags
  async createTag(tag: InputHashTagDtos, context: any): Promise<HashTag> {
    return await this.hashTagModel.create({
      ...tag,
      user_id: context.res.locals.user_id,
    });
  }

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
