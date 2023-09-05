import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AwsS3Operation } from 'src/utils/classes/AwsS3Operation';
import streamToBuffer from 'src/utils/functions/streamToBuffer';
import { FileUpload } from 'src/utils/interfaces/file-upload.interface';
import { Stream } from 'stream';
import { v4 as uuid } from 'uuid';
import {
  CreateProfileDtos,
  InputProfileDtos,
  UpdateProfileDtos,
} from './dtos/create-profile.dto';
import { Profile } from './entity/profile.entity';
@Injectable()
export class ProfileService {
  constructor(
    @InjectModel('Profiles') private readonly profileModel: Model<Profile>,
    private readonly configService: ConfigService,
  ) {}

  s3Client = new AwsS3Operation(
    'AWS_PROFILE_IMAGE_BUCKET_NAME',
    this.configService,
  );

  async findProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ user_id: userId });

    if (!profile) throw new BadRequestException('Could not find profile');

    return profile;
  }

  /**
   *
   * @param key {String} // File name key
   * @returns Promise{String}
   */
  public async generatePresignedUrl(key: string): Promise<string> {
    return this.configService.get('CLOUDFRONT_URL') + key;
  }

  /**
   *
   * @param fileName {String}
   * @param file {Stream}
   * @param mimetype {String}
   * @returns keyName {String} // for storing keyName to endUser
   */
  async uploadFile(fileName: string, file: Stream, mimetype: string) {
    const keyName = `${uuid()}-${fileName}`;

    // perfrom the upload operation
    streamToBuffer(file).then(async (buffer) => {
      await this.s3Client.sendToS3(keyName, buffer, mimetype);
    });

    return keyName;
  }

  /**
   * For deleting file operations from the Bucket
   * @param keyName {String}
   * @returns
   */
  private async deleteFile(keyName: string) {
    try {
      await this.s3Client.deleteToS3(keyName);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * All operation of file upload
   * @param data {Promise<FileUpload>}
   * @returns Record<string,string>
   */
  private async uploadFileOperation(
    data: Promise<FileUpload>,
  ): Promise<Record<string, string>> {
    const { createReadStream, filename, mimetype } = await data;

    const fileUploadKeyName = await this.uploadFile(
      filename,
      createReadStream(),
      mimetype,
    );

    const preSignedURL = await this.generatePresignedUrl(fileUploadKeyName);

    return {
      fileUploadKeyName,
      preSignedURL,
    };
  }

  async createProfile(data: InputProfileDtos, context: any): Promise<Profile> {
    const foundProfile = await this.profileModel.findOne({
      user_id: context.res.locals.user_id,
    });

    if (foundProfile) {
      throw new BadRequestException('Profile is already available');
    }

    const { firstName, middleName, lastName } = data;

    const { fileUploadKeyName, preSignedURL } = await this.uploadFileOperation(
      data.profileImage,
    );

    const profileObj: CreateProfileDtos = {
      profileImageKeyName: fileUploadKeyName,
      profileImage: preSignedURL,
      firstName,
      middleName,
      lastName,
      user_id: context.res.locals.user_id,
    };

    const profile = await this.profileModel.create(profileObj);
    return await profile.save();
  }

  async updateProfile(
    user_id: string,
    profileObj: UpdateProfileDtos,
  ): Promise<Profile> {
    /**
     * [1]: Find the profile by user id
     * [2]: if not profile the throw an error
     * [3]: if profile found as well as profile image found then go update and delete the old image
     * [4]: else return same object
     */

    // first find the profile by user_id
    const profile: Profile = await this.findProfileByUserId(user_id);

    if (!profile) {
      throw new BadRequestException('Profile does not exist');
    }

    // if profile object exists then this profile image and update it
    if (profileObj.profileImage) {
      const { preSignedURL, fileUploadKeyName } =
        await this.uploadFileOperation(profileObj.profileImage);

      // first delete the old object
      if (!(await this.deleteFile(profile.profileImageKeyName))) {
        throw new BadRequestException('Unknown Error Occured');
      }

      return await this.profileModel
        .findByIdAndUpdate(
          profile._id,
          {
            ...profileObj,
            profileImageKeyName: fileUploadKeyName,
            profileImage: preSignedURL,
          },
          {
            new: true,
          },
        )
        .exec();
      // return everything
    }

    return await this.profileModel
      .findByIdAndUpdate(profile._id, profileObj, {
        new: true,
      })
      .exec();
  }

  async deleteProfile(user_id: string): Promise<boolean> {
    /**
     * [1] find the profile
     * [2] delete from s3 bucket
     * [3] then delete the mongoose object
     * [4] return boolean value
     */

    const profile: Profile = await this.findProfileByUserId(user_id);

    if (!profile) {
      throw new BadRequestException('Profile does not exist');
    }

    // file deleted from here
    if (!(await this.deleteFile(profile.profileImageKeyName))) {
      throw new BadRequestException('Profile Image does not exist');
    }

    await this.profileModel.findByIdAndDelete(profile._id);

    return true;
  }
}
