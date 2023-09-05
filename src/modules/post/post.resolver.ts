import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { PostService } from './post.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { ResponsePostDtos } from './dtos/response-post.dto';
import { InputPostDtos } from './dtos/create-post.dtos';

@Resolver()
@UseGuards(AuthGuard)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => ResponsePostDtos)
  async createPost(
    @Args('postInput') post: InputPostDtos,
    @Context() context: any,
  ): Promise<ResponsePostDtos> {
    return this.postService.createPost(post, context);
  }
}
