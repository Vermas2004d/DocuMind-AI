import { downloadFromS3 } from "./s3.service.js";
import { processPdfBuffer } from "./ingestion.service.js";
import { indexDocuments } from "./qdrant.service.js";
import Document from "../models/Document.js";

export const ingestDocument = async (document) => {
  try {
    // 1. Mark document as processing
    document.status = "processing";
    await document.save();

    // 2. Download PDF from private S3 bucket
    const pdfBuffer = await downloadFromS3(document.s3Key);

    // 3. Extract text and create chunks
    const chunks = await processPdfBuffer({
      buffer: pdfBuffer,
      documentId: document._id,
      userId: document.userId,
      fileName: document.fileName,
    });

    console.log(`Indexing ${chunks.length} chunks into Qdrant...`);

    // 4. Generate embeddings and store vectors in Qdrant
    await indexDocuments(chunks);

    // 5. Mark document as ready
    document.status = "ready";
    await document.save();

    console.log(`Document ${document._id} is ready`);

    return document;
  } catch (error) {
    console.error("Document ingestion failed:", error);

    // Mark failed so the UI can show the correct status
    await Document.findByIdAndUpdate(document._id, {
      status: "failed",
    });

    throw error;
  }
};