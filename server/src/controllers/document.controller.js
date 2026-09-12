import { randomUUID } from "crypto";

import Document from "../models/Document.js";
import { uploadToS3 } from "../services/s3.service.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    // Temporary user ID until Google authentication is connected
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "x-user-id header is required for now",
      });
    }

    const file = req.file;

    const key = `documents/${userId}/${randomUUID()}-${file.originalname}`;

    // Upload file to S3
    const s3File = await uploadToS3({
      buffer: file.buffer,
      key,
      contentType: file.mimetype,
    });

    // Save document metadata in MongoDB
    const document = await Document.create({
      userId,
      fileName: file.originalname,
      s3Key: s3File.key,
      s3Url: s3File.url,
      fileType: file.mimetype,
      fileSize: file.size,
      status: "uploaded",
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
};

