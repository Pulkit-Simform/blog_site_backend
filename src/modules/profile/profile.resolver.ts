import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateProfileDtos, InputProfileDtos } from './dtos/create-profile.dto';
import { Profile } from './entity/profile.entity';
import { ProfileService } from './profile.service';

// import { FileInterceptor } from '@nestjs/platform-express';

@Resolver()
@UseGuards(AuthGuard)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Boolean)
  ProfileChecker(): boolean {
    return true;
  }

  @Mutation(() => Profile)
  async createProfile(
    @Args('profile') profile: InputProfileDtos,
    @Context() context: any,
  ): Promise<Profile> {
    return await this.profileService.createProfile(profile, context);
  }
}
