import { Router } from "express";
import multer from "multer";

import { uploadDocument , getUserDocuments} from "../controllers/document.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  },
});

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadDocument
);

router.get(
  "/",
  protect,
  getUserDocuments
);

export default router;

