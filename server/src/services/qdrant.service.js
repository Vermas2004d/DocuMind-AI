import { QdrantVectorStore } from "@langchain/qdrant";

import embeddings from "./embedding.service.js";

const COLLECTION_NAME = "documind_documents";

export const getQdrantStore = async () => {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: COLLECTION_NAME,
    }
  );

  return vectorStore;
};