import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { InputProfileDtos, UpdateProfileDtos } from './dtos/create-profile.dto';
import { Profile } from './entity/profile.entity';
import { ProfileService } from './profile.service';

/**
 * TODO:
 * - [x] Update the profile and solve the bug
 * - [x] update the profile image
 * - [x] delete the profile
 * - [] apply CDN to routes
 * - [] add winston logger
 * - [] write the test case for individual units
 */

@Resolver()
@UseGuards(AuthGuard)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  // for getting user specific profile information
  @Query(() => Profile)
  getProfile(@Context() context: any): Promise<Profile> {
    return this.profileService.findProfileByUserId(context.res.locals.user_id);
  }

  // for getting deletion
  @Query(() => Boolean)
  deleteProfile(@Context() context: any): Promise<boolean> {
    return this.profileService.deleteProfile(context.res.locals.user_id);
  }

  // create a new profile
  @Mutation(() => Profile)
  async createProfile(
    @Args('profile') profile: InputProfileDtos,
    @Context() context: any,
  ): Promise<Profile> {
    return await this.profileService.createProfile(profile, context);
  }

  // update profile
  @Mutation(() => Profile)
  async updateProfile(
    @Args('profile') profile: UpdateProfileDtos,
    @Context() context: any,
  ): Promise<Profile> {
    return await this.profileService.updateProfile(
      context.res.locals.user_id,
      profile,
    );
  }
}
