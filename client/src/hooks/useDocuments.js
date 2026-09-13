import { useQuery } from "@tanstack/react-query";
import api from "../lib/api.js";

const fetchDocuments = async () => {
  const response = await api.get("/documents");

  return response.data.documents;
};

export const useDocuments = (enabled = true) => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
    enabled: Boolean(enabled),
  });
};