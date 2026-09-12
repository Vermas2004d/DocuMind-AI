import { useQuery } from "@tanstack/react-query";
import api from "../lib/api.js";

const DEV_USER_ID = "6aa3f24ee448fe20630cbf2d";

const fetchChatHistory = async (documentId) => {
  const response = await api.get(
    `/chat/${documentId}`,
    {
      headers: {
        "x-user-id": "6aa3f24ee448fe20630cbf2d",
      },
    }
  );

  return response.data.messages;
};

export const useChatHistory = (documentId) => {
  return useQuery({
    queryKey: ["chat", documentId],
    queryFn: () => fetchChatHistory(documentId),
    enabled: !!documentId,
  });
};