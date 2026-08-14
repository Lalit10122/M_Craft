import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummyaccesskey',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummysecretkey',
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'malkincraft-dummy-bucket';

export { s3Client, S3_BUCKET };
