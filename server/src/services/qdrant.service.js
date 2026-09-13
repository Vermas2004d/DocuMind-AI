import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import embeddings from "./embedding.service.js";

const COLLECTION_NAME = "documind_documents";

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const createPayloadIndexes = async () => {
  try {
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: "metadata.userId",
      field_schema: "keyword",
    });

    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: "metadata.documentId",
      field_schema: "keyword",
    });

    console.log("Qdrant payload indexes created");
  } catch (error) {
    console.error(
      "Failed to create Qdrant payload indexes:",
      error
    );
  }
};

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
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: COLLECTION_NAME,
    }
  );

  console.log(
    `Successfully indexed ${documents.length} chunks into Qdrant`
  );

  return vectorStore;
};