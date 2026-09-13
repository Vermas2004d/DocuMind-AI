import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../lib/api.js";

const askQuestion = async ({
  question,
  documentId,
}) => {
  const response = await api.post("/chat/ask", {
    question,
    documentId,
  });

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