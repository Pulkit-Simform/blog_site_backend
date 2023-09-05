import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { InputHashTagDtos } from './dtos/create-hashtag.dto';
import { HashTag } from './entity/hashtag.entity';
import { HashtagService } from './hashtag.service';

@Resolver()
@UseGuards(AuthGuard)
export class HashtagResolver {
  constructor(private readonly hashTagService: HashtagService) {}

  /**
   * Mutation Tags
   * @param tag {InputHashTagDtos}
   * @param context {any}
   * @returns
   */
  @Mutation(() => HashTag)
  async createtag(
    @Args('tag') tag: InputHashTagDtos,
    @Context('context') context: any,
  ): Promise<HashTag> {
    return this.hashTagService.createTag(tag, context);
  }
}
