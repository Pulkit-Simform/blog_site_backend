import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { InputPostDtos } from './dtos/create-post.dtos';
import { GetPostDtos } from './dtos/get-post.dto';
import { ResponsePostDtos } from './dtos/response-post.dto';
import { PostService } from './services/post.service';
import { UploadPostService } from './services/upload-post.service';
import { HashTag } from '../hashtag/entity/hashtag.entity';
import { HashtagService } from '../hashtag/hashtag.service';

@Resolver()
@UseGuards(AuthGuard)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly uploadPostService: UploadPostService,
    private readonly hashTagService: HashtagService,
  ) {}

  @Query(() => [GetPostDtos])
  async getPostByUser(@Context() context: any): Promise<GetPostDtos[]> {
    return await this.postService.getPostByUser(context);
  }

  @Mutation(() => ResponsePostDtos)
  async createPost(
    @Args('postInput') post: InputPostDtos,
    @Context() context: any,
  ): Promise<ResponsePostDtos> {
    // first upload the photos and get signedUrl and keyName from it
    const postImageObj = await this.uploadPostService.upload(post.post_image);

    const tagIds: HashTag[] = await this.hashTagService.postRelatedTagCreation(
      post.hashtag,
      context,
    );

    // FIXME: refactor this too
    return this.postService.createPost(
      post,
      postImageObj.signedUrl,
      postImageObj.keyName,
      tagIds,
      context,
    );
  }
}
