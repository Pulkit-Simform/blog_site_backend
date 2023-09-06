import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { InputHashTagDtos } from './dtos/create-hashtag.dto';
import { HashTag } from './entity/hashtag.entity';
import { HashtagService } from './hashtag.service';
import { TagRelatedPostsDtos } from './dtos/tagRelatedPost.dto';

@Resolver()
@UseGuards(AuthGuard)
export class HashtagResolver {
  constructor(private readonly hashTagService: HashtagService) {}

  @Query(() => [TagRelatedPostsDtos])
  async getTagRelatedPosts(
    @Args('tag') tag: string,
  ): Promise<TagRelatedPostsDtos[]> {
    return this.hashTagService.tagRelatedPost(tag);
  }

  /**
   * Mutation Tags
   * @param tag {InputHashTagDtos}
   * @param context {any}
   * @returns
   */
  // FIXME: just add # if it comes as raw string and all in lowercase
  @Mutation(() => HashTag)
  async createtag(
    @Args('tag') tag: InputHashTagDtos,
    @Context('context') context: any,
  ): Promise<HashTag> {
    return this.hashTagService.createTag(tag, context);
  }
}
