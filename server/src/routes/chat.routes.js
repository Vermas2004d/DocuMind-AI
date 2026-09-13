import { Router } from "express";

import {
  askQuestion,
  getChatHistory,
} from "../controllers/chat.controller.js";

import { rateLimit } from "../middlewares/rateLimit.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/ask",
  protect,
  rateLimit({
    windowSeconds: 60,
    maxRequests: 20,
    keyPrefix: "rate-limit:chat",
  }),
  askQuestion
);

router.get(
  "/:documentId",
  protect,
  getChatHistory
);

export default router;