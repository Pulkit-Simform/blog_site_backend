import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { InputPostDtos } from './dtos/create-post.dtos';
import { GetPostDtos } from './dtos/get-post.dto';
import { ResponsePostDtos } from './dtos/response-post.dto';
import { PostService } from './post.service';

@Resolver()
@UseGuards(AuthGuard)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => [GetPostDtos])
  async getPostByUser(@Context() context: any): Promise<GetPostDtos[]> {
    return await this.postService.getPostByUser(context);
  }

  @Mutation(() => ResponsePostDtos)
  async createPost(
    @Args('postInput') post: InputPostDtos,
    @Context() context: any,
  ): Promise<ResponsePostDtos> {
    return this.postService.createPost(post, context);
  }
}
