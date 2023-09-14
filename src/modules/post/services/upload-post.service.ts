import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsS3Operation } from 'src/utils/classes/AwsS3Operation';
import getCloudFrontPrivateKey from 'src/utils/functions/getCloudFrontPrivateKey';
import streamToBuffer from 'src/utils/functions/streamToBuffer';
import { FileUpload } from 'src/utils/interfaces/file-upload.interface';
import { v4 as uuid } from 'uuid';
import { ResponsePostImageDtos } from '../dtos/response-post.dto';

@Injectable()
export class UploadPostService {
  constructor(private readonly configService: ConfigService) {}

  private s3Client = new AwsS3Operation(
    this.configService.get('AWS_POST_IMAGE_BUCKET_NAME'),
    this.configService,
  );

  // common function
  private async uploadToS3(postImage: Promise<FileUpload>): Promise<string> {
    const { createReadStream, mimetype, filename } = await postImage;
    const keyName = `${uuid()}-${filename}`;

    streamToBuffer(createReadStream()).then(async (buffer: Buffer) => {
      await this.s3Client.sendToS3(keyName, buffer, mimetype);
    });

    return keyName;
  }

  /**
   *
   * @param postImage
   * @returns
   */
  async upload(postImage: Promise<FileUpload>): Promise<ResponsePostImageDtos> {
    const keyName = await this.uploadToS3(postImage);

    const signedUrl = await getSignedUrl({
      url: `${this.configService.get<string>('CLOUDFRONT_URL')}` + keyName,
      keyPairId: this.configService.get<string>('CLOUDFRONT_KEY_PAIR_ID'),
      privateKey: await getCloudFrontPrivateKey(),
      dateLessThan: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7,
      ).toISOString(),
    });

    return {
      signedUrl,
      keyName,
    };
  }
}
