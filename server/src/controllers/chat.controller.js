import { askDocument } from "../services/rag.service.js";

export const askQuestion = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    // Validate question
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
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

    // Ask RAG pipeline
    const result = await askDocument({
      question,
      userId,
      documentId,
    });

    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error("Ask question error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to answer question",
    });
  }
};