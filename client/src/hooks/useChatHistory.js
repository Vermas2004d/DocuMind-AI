import { useQuery } from "@tanstack/react-query";
import api from "../lib/api.js";

const fetchChatHistory = async (documentId) => {
  const response = await api.get(`/chat/${documentId}`);

  return response.data.messages;
};

export const useChatHistory = (documentId) => {
  return useQuery({
    queryKey: ["chat", documentId],
    queryFn: () => fetchChatHistory(documentId),
    enabled: !!documentId,
  });
};