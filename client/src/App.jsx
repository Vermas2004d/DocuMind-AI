import { useState } from "react";
import { useDocuments } from "./hooks/useDocuments.js";
import DocumentUpload from "./components/DocumentUpload.jsx";
import Chat from "./components/Chat.jsx";

function App() {
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const {
    data: documents = [],
    isLoading,
    isError,
  } = useDocuments();

  return (
    <div>
      <h1>DocuMind AI</h1>

      <p>Intelligent Document Q&A with RAG</p>

      <DocumentUpload />

      <hr />

      <h2>Your Documents</h2>

      {isLoading && <p>Loading documents...</p>}

      {isError && (
        <p>Failed to load documents.</p>
      )}

      {!isLoading && documents.length === 0 && (
        <p>No documents uploaded yet.</p>
      )}

      {documents.map((document) => (
        <div key={document._id}>
          <h3>{document.fileName}</h3>

          <p>
            Status: <strong>{document.status}</strong>
          </p>

          <p>
            Size:{" "}
            {(document.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>

          <button
            disabled={document.status !== "ready"}
            onClick={() => {
              setSelectedDocumentId(document._id);
            }}
          >
            {document.status === "ready"
              ? "Ask Questions"
              : "Processing..."}
          </button>
        </div>
      ))}

      <hr />

      {selectedDocumentId && (
        <Chat documentId={selectedDocumentId} />
      )}
    </div>
  );
}

export default App;