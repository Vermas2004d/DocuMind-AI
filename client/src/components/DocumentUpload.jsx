import { useState } from "react";
import { useUploadDocument } from "../hooks/useUploadDocument.js";

function DocumentUpload() {
  const [file, setFile] = useState(null);

  const {
    mutate: uploadDocument,
    isPending,
    isSuccess,
    isError,
    error,
  } = useUploadDocument();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    uploadDocument(file);
  };

  return (
    <div>
      <h2>Upload Document</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            setFile(event.target.files[0]);
          }}
        />

        <button type="submit" disabled={!file || isPending}>
          {isPending ? "Uploading..." : "Upload PDF"}
        </button>
      </form>

      {file && <p>Selected: {file.name}</p>}

      {isPending && (
        <p>
          Processing document... This may take a moment.
        </p>
      )}

      {isSuccess && (
        <p>
          Document uploaded and processed successfully.
        </p>
      )}

      {isError && (
        <p>
          Upload failed:{" "}
          {error?.response?.data?.message || error.message}
        </p>
      )}
    </div>
  );
}

export default DocumentUpload;