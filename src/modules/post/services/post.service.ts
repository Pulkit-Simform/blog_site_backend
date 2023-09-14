import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { HashTag } from '../../hashtag/entity/hashtag.entity';
import { HashtagService } from '../../hashtag/hashtag.service';
import { CreatePostDtos, InputPostDtos } from '../dtos/create-post.dtos';
import { GetPostDtos } from '../dtos/get-post.dto';
import { ResponsePostDtos } from '../dtos/response-post.dto';
import { Post } from '../entity/posts.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Posts') private readonly postModel: Model<Post>,
    private readonly hashTagService: HashtagService,
  ) {}

  // methods for resolvers
  async getPostByUser(context: any): Promise<GetPostDtos[]> {
    const pipeline = [
      {
        $match: { user_id: new ObjectId(context.res.locals.user_id) },
      },
      {
        $lookup: {
          from: 'hashtags',
          localField: 'hashtag',
          foreignField: '_id',
          as: 'hashtag',
        },
      },
      {
        $project: {
          post_uuid: 1,
          post_caption: 1,
          post_image: 1,
          hashtag: {
            $map: {
              input: '$hashtag',
              as: 'tag',
              in: '$$tag.hashtag_text',
            },
          },
        },
      },
    ];

    const posts = await this.postModel.aggregate(pipeline);
    return posts;
  }

  async createPost(
    post: InputPostDtos,
    signedUrl: string,
    keyName: string,
    tagIds: HashTag[],
    context: any,
  ): Promise<ResponsePostDtos> {
    const postObj: CreatePostDtos | ResponsePostDtos = {
      ...post,
      user_id: context.res.locals.user_id,
      post_uuid: uuid(),
      post_image: signedUrl,
      post_image_key: keyName,
      hashtag: tagIds,
    };

    const posts = await this.postModel.create(postObj);

    // FIXME: refactor this
    for (const tag of posts.hashtag) {
      const tags = await this.hashTagService.getTagByIds(tag._id);
      // update the tags with created post id include them in array
      this.hashTagService.updateTagForPost(tags.id, posts.id);
    }

    const responseObj: ResponsePostDtos = {
      ...postObj,
      hashtag: post.hashtag,
    };

    return responseObj;
  }
}
