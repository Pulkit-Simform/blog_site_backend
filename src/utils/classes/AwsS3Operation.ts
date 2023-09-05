import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export class AwsS3Operation {
  public s3Client: S3Client;

  constructor(
    private readonly bucketName: string,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async sendToS3(keyName: string, buffer: Buffer, mimetype: string) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_PROFILE_IMAGE_BUCKET_NAME'),
        Key: keyName,
        Body: buffer,
        ContentType: mimetype,
      }),
    );
  }

  async deleteToS3(keyName: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get<string>('AWS_PROFILE_IMAGE_BUCKET_NAME'),
        Key: keyName,
      }),
    );
  }
}
