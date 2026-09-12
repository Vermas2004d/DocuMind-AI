import { Router } from "express";
import { askQuestion } from "../controllers/chat.controller.js";
import { rateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/ask",
    rateLimit({
        windowSeconds: 60,
        maxRequests: 20,
        keyPrefix: "rate-limit:chat",
    }),
    askQuestion
);

export default router;

