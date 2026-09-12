import { useQuery } from "@tanstack/react-query";
import api from "../lib/api.js";

const DEV_USER_ID = "6aa3f24ee448fe20630cbf2d";

const fetchDocuments = async () => {
  const response = await api.get("/documents", {
    headers: {
      "x-user-id": "6aa3f24ee448fe20630cbf2d",
    },
  });

  return response.data.documents;
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments,
  });
};