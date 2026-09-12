import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import s3Client from "../config/s3.js";

export const uploadToS3 = async ({
  buffer,
  key,
  contentType,
}) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return {
    key,
    url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
};