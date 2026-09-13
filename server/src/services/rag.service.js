import {
  createRagCacheKey,
  getCachedResponse,
  setCachedResponse,
} from "./cache.service.js";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import Document from "../models/Document.js";
import embeddings from "./embedding.service.js";

const COLLECTION_NAME = "documind_documents";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0,
});

export const askDocument = async ({
  question,
  userId,
  documentId,
}) => {
  // 1. Verify that the document belongs to this user
  const document = await Document.findOne({
    _id: documentId,
    userId,
  });

  if (!document) {
    throw new Error("Document not found or access denied");
  }

  // 2. Create Redis cache key
  const cacheKey = createRagCacheKey({
    userId,
    documentId,
    question,
  });

  // 3. Check Redis cache
  const cachedResult = await getCachedResponse(cacheKey);

  if (cachedResult) {
    console.log("RAG cache HIT");
    return cachedResult;
  }

  console.log("RAG cache MISS");

  // 4. Connect to existing Qdrant collection
  const vectorStore =
    await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: COLLECTION_NAME,
      }
    );

  // 5. Restrict vector search to this user's document
  const filter = {
    must: [
      {
        key: "metadata.userId",
        match: {
          value: userId.toString(),
        },
      },
      {
        key: "metadata.documentId",
        match: {
          value: documentId.toString(),
        },
      },
    ],
  };

  // 6. Search only relevant chunks from this document
  const results = await vectorStore.similaritySearch(
    question,
    5,
    filter
  );

  // 7. Make sure we found something
  if (!results.length) {
    return {
      answer:
        "I could not find relevant information in the document.",
      sources: [],
    };
  }

  // 8. Build context
  const context = results
    .map((doc, index) => {
      return `
SOURCE ${index + 1}

File: ${doc.metadata.fileName}

Page: ${doc.metadata.page ?? "Unknown"}

${doc.pageContent}
`;
    })
    .join("\n");

  // 9. Ask Gemini using retrieved context
  const prompt = `
You are DocuMind AI, a document question-answering assistant.

Answer the user's question using ONLY the provided document context.

If the answer cannot be found in the context, say:

"I could not find this information in the document."

Do not make up information.

DOCUMENT CONTEXT:

${context}

USER QUESTION:

${question}
`;

  const response = await llm.invoke(prompt);

  // 10. Create final result
  const result = {
    answer: response.content,
    sources: results.map((doc) => ({
      documentId: doc.metadata.documentId,
      fileName: doc.metadata.fileName,
      page: doc.metadata.page,
    })),
  };

  // 11. Save result in Redis for 1 hour
  await setCachedResponse(
    cacheKey,
    result,
    3600
  );

  console.log("RAG response cached");

  // 12. Return result
  return result;
};