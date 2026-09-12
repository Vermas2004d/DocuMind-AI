import crypto from "crypto";
import redisClient from "../config/redis.js";

export const createRagCacheKey = ({
  userId,
  documentId,
  question,
}) => {
  const normalizedQuestion = question
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const questionHash = crypto
    .createHash("sha256")
    .update(normalizedQuestion)
    .digest("hex");

  return `rag:${userId}:${documentId}:${questionHash}`;
};

export const getCachedResponse = async (key) => {
  const cached = await redisClient.get(key);

  if (!cached) {
    return null;
  }

  return JSON.parse(cached);
};

export const setCachedResponse = async (
  key,
  value,
  ttlSeconds = 3600
) => {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
};