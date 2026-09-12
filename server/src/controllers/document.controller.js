import { randomUUID } from "crypto";

import Document from "../models/Document.js";

import { uploadToS3 } from "../services/s3.service.js";
import { ingestDocument } from "../services/document-ingestion.service.js";

export const uploadDocument = async (req, res) => {
  try {
    // 1. Check if file exists
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

    // 2. Generate unique S3 key
    const key = `documents/${userId}/${randomUUID()}-${file.originalname}`;

    // 3. Upload PDF to S3
    const s3File = await uploadToS3({
      buffer: file.buffer,
      key,
      contentType: file.mimetype,
    });

    // 4. Save document metadata in MongoDB
    const document = await Document.create({
      userId,
      fileName: file.originalname,
      s3Key: s3File.key,
      s3Url: s3File.url,
      fileType: file.mimetype,
      fileSize: file.size,
      status: "uploaded",
    });

    // 5. Process PDF → chunks → embeddings → Qdrant
    await ingestDocument(document);

    // 6. Return successful response
    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully",
      document,
    });
  } catch (error) {
    console.error("Document upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload and process document",
    });
  }
};


export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "x-user-id header is required for now",
      });
    }

    const documents = await Document.find({
      userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};