import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateProfileDtos } from './dtos/create-profile.dto';
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

  // @Mutation(() => Profile)
  // @UseInterceptors(FileInterceptor('profileImage'))
  // async createProfile(
  //   @Args('profileImage',{ () => }) profileImage: ImageOnlyProfile,
  //   @Args('data') data: BaseProfileDtos,
  // ): Promise<Profile> {
  //   const createProfile: CreateProfileDtos = {
  //     data,
  //     profileImage,
  //   };

  //   return await this.profileService.createProfile(createProfile);
  // }

  @Mutation(() => Profile)
  async createProfile(
    @Args('profile') profile: CreateProfileDtos,
  ): Promise<Profile> {
    console.log('Profile invoked');
    return await this.profileService.createProfile(profile);
  }
}
