import { askDocument } from "../services/rag.service.js";
import Chat from "../models/Chat.js";

export const askQuestion = async (req, res) => {
  try {
    const { question, documentId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "x-user-id header is required for now",
      });
    }

    // 1. Ask RAG pipeline
    const result = await askDocument({
      question,
      userId,
      documentId,
    });

    // 2. Find existing chat for this user + document
    let chat = await Chat.findOne({
      userId,
      documentId,
    });

    // 3. Create chat if it doesn't exist
    if (!chat) {
      chat = await Chat.create({
        userId,
        documentId,
        messages: [],
      });
    }

    // 4. Save user question
    chat.messages.push({
      role: "user",
      content: question,
    });

    // 5. Save assistant answer + sources
    chat.messages.push({
      role: "assistant",
      content: result.answer,
      sources: result.sources,
    });

    // 6. Save chat
    await chat.save();

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

export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "x-user-id header is required for now",
      });
    }

    const chat = await Chat.findOne({
      userId,
      documentId,
    });

    return res.status(200).json({
      success: true,
      messages: chat?.messages || [],
    });
  } catch (error) {
    console.error("Get chat history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
};

