import {
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
    return await this.profileModel.findOne({ user_id: userId });
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

  async createProfile(data: InputProfileDtos, context: any): Promise<Profile> {
    // 1
    // if the profile is already exists, then throw an error
    if (await this.findProfileByUserId(context.res.locals.user_id)) {
      throw new BadRequestException('Profile is already available');
    }

    // 2
    // get initial values from profile
    const { createReadStream, filename, mimetype } = await data.profileImage;
    const { firstName, middleName, lastName } = data;

    // 3
    // upload file to s3 and get keyName from it
    const fileUploadKeyName = await this.uploadFile(
      filename,
      createReadStream(),
      mimetype,
    );

    // 4
    // for getting pre signed url for profile
    const preSignedURL = await this.generatePresignedUrl(fileUploadKeyName);

    // 5
    // construct the profile object
    const profileObj: CreateProfileDtos = {
      profileImageKeyName: fileUploadKeyName,
      profileImage: preSignedURL,
      firstName,
      middleName,
      lastName,
      user_id: context.res.locals.user_id,
    };

    // in the end create a new profile and save
    const profile = await this.profileModel.create(profileObj);
    return await profile.save();
  }

  async updateProfile(
    user_id: string,
    profileObj: UpdateProfileDtos,
  ): Promise<Profile> {
    // first find the profile by user_id
    const profile = await this.findProfileByUserId(user_id);

    if (!profile) {
      throw new BadRequestException('Profile not exist');
    }

    return await this.profileModel.findByIdAndUpdate(user_id, profileObj);
  }
}
