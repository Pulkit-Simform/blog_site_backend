import { UseGuards } from '@nestjs/common';
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
    // get all variables
    const { createReadStream, filename, mimetype } = await profile.profileImage;
    const { firstName, middleName, lastName } = profile;

    // upload file to s3 and get keyName from it
    const fileUploadKeyName = await this.profileService.uploadFile(
      filename,
      createReadStream(),
      mimetype,
    );

    // for getting pre signed url for profile
    const preSignedURL = await this.profileService.generatePresignedUrl(
      fileUploadKeyName,
    );

    const profileObj: CreateProfileDtos = {
      profileImageKeyName: fileUploadKeyName,
      profileImage: preSignedURL,
      firstName,
      middleName,
      lastName,
      user_id: context.res.locals.user_id,
    };

    return await this.profileService.createProfile(profileObj);
  }
}
