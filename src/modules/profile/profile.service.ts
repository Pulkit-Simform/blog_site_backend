import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stream } from 'stream';
import { v4 as uuid } from 'uuid';
import {
  CreateProfileDtos,
  FileUpload,
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

  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_REGION'),
    credentials: {
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    },
  });

  async findProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ user_id: userId });

    if (!profile) throw new BadRequestException('Could not find profile');

    return profile;
  }

  /**
   *
   * @param stream {Stream}
   * @returns Promise<Buffer>
   */
  private async streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const _buf: any[] = [];

      stream.on('data', (chunk) => _buf.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(_buf)));
      stream.on('error', (err) => reject(err));
    });
  }

  /**
   *
   * @param key {String} // File name key
   * @returns Promise{String}
   */
  public async generatePresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('AWS_PROFILE_IMAGE_BUCKET_NAME'),
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command);
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
    this.streamToBuffer(file).then(async (buffer) => {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get<string>(
            'AWS_PROFILE_IMAGE_BUCKET_NAME',
          ),
          Key: keyName,
          Body: buffer,
          ContentType: mimetype,
        }),
      );
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
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.configService.get<string>(
            'AWS_PROFILE_IMAGE_BUCKET_NAME',
          ),
          Key: keyName,
        }),
      );

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
