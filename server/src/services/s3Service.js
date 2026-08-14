import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { s3Client, S3_BUCKET } from '../config/s3.js';

export const extractKeyFromUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch (error) {
    return '';
  }
};

export const deleteFromS3 = async (imageUrl) => {
  try {
    const key = extractKeyFromUrl(imageUrl);
    if (!key) return;
    
    await s3Client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key
    }));
  } catch (error) {
    console.error(`Failed to delete from S3: ${error.message}`);
  }
};

export const processImageBuffer = async (buffer) => {
  try {
    return await sharp(buffer).rotate().toBuffer();
  } catch (error) {
    console.error(`Failed to process image buffer: ${error.message}`);
    return buffer;
  }
};
