import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AwsS3Operation } from 'src/utils/classes/AwsS3Operation';
import getCloudFrontPrivateKey from 'src/utils/functions/getCloudFrontPrivateKey';
import streamToBuffer from 'src/utils/functions/streamToBuffer';
import { FileUpload } from 'src/utils/interfaces/file-upload.interface';
import { v4 as uuid } from 'uuid';
import { HashTag } from '../hashtag/entity/hashtag.entity';
import { HashtagService } from '../hashtag/hashtag.service';
import { CreatePostDtos, InputPostDtos } from './dtos/create-post.dtos';
import { ResponsePostDtos } from './dtos/response-post.dto';
import { Post } from './entity/posts.entity';
import { GetPostDtos } from './dtos/get-post.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Posts') private readonly postModel: Model<Post>,
    private readonly hashTagService: HashtagService,
    private readonly configService: ConfigService,
  ) {}

  private s3Client = new AwsS3Operation(
    this.configService.get('AWS_POST_IMAGE_BUCKET_NAME'),
    this.configService,
  );

  // common function
  private async uploadToS3(postImage: Promise<FileUpload>): Promise<string> {
    const { createReadStream, mimetype, filename } = await postImage;
    const keyName = `${uuid()}-${filename}`;

    streamToBuffer(createReadStream()).then(async (buffer: Buffer) => {
      await this.s3Client.sendToS3(keyName, buffer, mimetype);
    });

    return keyName;
  }

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
    context: any,
  ): Promise<ResponsePostDtos> {
    /**
     * [1] Create tags : (if tags available) then get the id of it
     * [2] Upload image to s3 via cloudfront server
     * [3] Create post
     * [4] update all tags with its post_id
     * [5] return post with all
     */

    const tagIds: HashTag[] = [];

    // Operation [1]
    for (let tag of post.hashtag) {
      // tag operations for lowering and adding # at beginning of tag
      if (tag.charAt(0) !== '#') {
        tag = '#' + tag;
      }

      tag = tag.toLowerCase();

      let availableTag = await this.hashTagService.getTag(tag);

      if (!availableTag) {
        availableTag = await this.hashTagService.createTag(
          { hashtag_text: tag },
          context,
        );
      }

      tagIds.push(availableTag._id);
    }

    // Operation [2]
    const keyName = await this.uploadToS3(post.post_image);

    const signedUrl: string = getSignedUrl({
      url: `${this.configService.get<string>('CLOUDFRONT_URL')}` + keyName,
      keyPairId: this.configService.get<string>('CLOUDFRONT_KEY_PAIR_ID'),
      privateKey: await getCloudFrontPrivateKey(),
      dateLessThan: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7,
      ).toISOString(),
    });

    // Operation [3]
    const postObj: CreatePostDtos | ResponsePostDtos = {
      ...post,
      user_id: context.res.locals.user_id,
      post_uuid: uuid(),
      post_image: signedUrl,
      post_image_key: keyName,
      hashtag: tagIds,
    };

    const posts = await this.postModel.create(postObj);

    // Operation [4]
    for (const tag of posts.hashtag) {
      const tags = await this.hashTagService.getTagByIds(tag._id);
      // update the tags with created post id include them in array
      this.hashTagService.updateTagForPost(tags.id, posts.id);
    }

    // Operation [5]
    const responseObj: ResponsePostDtos = {
      ...postObj,
      hashtag: post.hashtag,
    };

    return responseObj;
  }
}
