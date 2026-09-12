import {
  PutObjectCommand,
  GetObjectCommand,
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

export const downloadFromS3 = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);

  const chunks = [];

  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};