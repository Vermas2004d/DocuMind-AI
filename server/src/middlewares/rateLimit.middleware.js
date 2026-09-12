import redisClient from "../config/redis.js";

export const rateLimit = ({
  windowSeconds,
  maxRequests,
  keyPrefix,
}) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers["x-user-id"];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "x-user-id header is required",
        });
      }

      const key = `${keyPrefix}:${userId}`;

      const currentCount = await redisClient.incr(key);

      // First request → start expiration timer
      if (currentCount === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (currentCount > maxRequests) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);

      // Don't break the application if Redis temporarily fails
      next();
    }
  };
};