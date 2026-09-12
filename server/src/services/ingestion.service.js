import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const processPdfBuffer = async ({
  buffer,
  documentId,
  userId,
  fileName,
}) => {
  const tempFilePath = path.join(
    os.tmpdir(),
    `documind-${Date.now()}.pdf`
  );
                                     
  try {
    // 1. Write PDF temporarily
    await fs.writeFile(tempFilePath, buffer);

    // 2. Load PDF using LangChain
    const loader = new PDFLoader(tempFilePath);

    const documents = await loader.load();

    console.log(`PDF pages loaded: ${documents.length}`);

    // 3. Split PDF into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(documents);

    console.log(`Total chunks created: ${chunks.length}`);

    // 4. Add application metadata to every chunk
    const enrichedChunks = chunks.map((chunk) => {
      chunk.metadata = {
        ...chunk.metadata,
        documentId: documentId.toString(),
        userId: userId.toString(),
        fileName,
      };

      return chunk;
    });

    return enrichedChunks;
  } finally {
    // 5. Delete temporary PDF
    await fs.unlink(tempFilePath).catch(() => {});
  }
};

