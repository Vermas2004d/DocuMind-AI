import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../lib/api.js";

const DEV_USER_ID = "6aa3f24ee448fe20630cbf2d";

const askQuestion = async ({
  question,
  documentId,
}) => {
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: askQuestion,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.documentId],
      });
    },
  });
};