import { useMutation } from "@tanstack/react-query";
import api from "../lib/api.js";

const DEV_USER_ID = "6aa3f24ee448fe20630cbf2d";

const askQuestion = async ({ question, documentId }) => {
  const response = await api.post(
    "/chat/ask",
    {
      question,
      documentId,
    },
    {
      headers: {
        "x-user-id": "6aa3f24ee448fe20630cbf2d",
      },
    }
  );

  return response.data;
};

export const useAskQuestion = () => {
  return useMutation({
    mutationFn: askQuestion,
  });
};

