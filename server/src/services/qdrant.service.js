
import { QdrantVectorStore } from "@langchain/qdrant";
import embeddings from "./embedding.service.js";

const COLLECTION_NAME = "documind_documents";

export const indexDocuments = async (documents) => {
  if (!documents || documents.length === 0) {
    throw new Error("No document chunks available for indexing");
  }

  console.log(
    `Creating embeddings and indexing ${documents.length} chunks...`
  );

  const vectorStore = await QdrantVectorStore.fromDocuments(
    documents,
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: COLLECTION_NAME,
    }
  );

  console.log(
    `Successfully indexed ${documents.length} chunks into Qdrant`
  );

  return vectorStore;
};