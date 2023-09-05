import { readFileSync } from 'fs';
import { join } from 'path';

export default async function getCloudFrontPrivateKey(): Promise<string> {
  const result = readFileSync(
    join(__dirname, '../../../', 'cloudfront_private_key.pem'),
    'utf-8',
  );

  return result;
}
