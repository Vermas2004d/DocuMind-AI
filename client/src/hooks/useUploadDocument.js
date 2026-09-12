import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";

const DEV_USER_ID = "6aa3f24ee448fe20630cbf2d";

const uploadDocument = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-user-id": "6aa3f24ee448fe20630cbf2d",
    },
  });

  return response.data;
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });
};