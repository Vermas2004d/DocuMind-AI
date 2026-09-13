import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { connectRedis } from "./config/redis.js";
import { createPayloadIndexes } from "./services/qdrant.service.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://documind-ai-two-bay.vercel.app",
  process.env.CLIENT_URL?.trim().replace(/\/+$/, ""),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.some(
          (allowed) =>
            origin === allowed ||
            origin.replace(/\/+$/, "") === allowed.replace(/\/+$/, "") ||
            origin === `https://${allowed.replace(/^https?:\/\//, "")}`
        ) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("vercel.app");

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

connectDB();
connectRedis();
createPayloadIndexes();

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});