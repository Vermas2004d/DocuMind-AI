import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DocuMind AI backend is running",
  });
});

export default router;