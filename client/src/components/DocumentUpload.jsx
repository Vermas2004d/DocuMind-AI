import { useRef, useState } from "react";
import { useUploadDocument } from "../hooks/useUploadDocument.js";

function DocumentUpload() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const {
    mutate: uploadDocument,
    isPending,
    isSuccess,
    isError,
    error,
  } = useUploadDocument();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      return;
    }

    setFile(droppedFile);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!file || isPending) return;

    uploadDocument(file);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileSize = file ? (file.size / 1024 / 1024).toFixed(2) : null;

  return (
    <section className="upload-section">
      <div className="section-heading">
        <div>
          <h2>Upload a document</h2>
          <p>Upload a PDF and start asking questions about it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className={`upload-dropzone ${
            file ? "has-file" : ""
          } ${isPending ? "uploading" : ""}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={!file && !isPending ? handleBrowse : undefined}
          role={!file ? "button" : undefined}
          tabIndex={!file ? 0 : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            hidden
          />

          {!file ? (
            <>
              <div className="upload-icon">↑</div>

             <h3 className="upload-title">Drop your PDF here</h3>

              <p className="upload-description">
                Drag & drop your PDF here, or{" "}
                <button
                  type="button"
                  className="browse-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleBrowse();
                  }}
                >
                  browse from your computer
                </button>
              </p>

              <span className="upload-limit">
                PDF files only · Maximum 10 MB
              </span>
            </>
          ) : (
            <div className="selected-file">
              <div className="pdf-icon">PDF</div>

              <div className="file-details">
                <strong>{file.name}</strong>
                <span>{fileSize} MB</span>
              </div>

              {!isPending && (
                <button
                  type="button"
                  className="remove-file"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove();
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>

        {file && (
          <button type="submit" className="upload-button" disabled={isPending}>
            {isPending ? (
              <>
                <span className="button-spinner" />
                Processing document...
              </>
            ) : (
              "Upload PDF"
            )}
          </button>
        )}
      </form>

      {isPending && (
        <div className="upload-message processing">
          <span className="status-dot" />
          Uploading and processing your document. This may take a moment...
        </div>
      )}

      {isSuccess && (
        <div className="upload-message success">
          ✓ Document uploaded and processed successfully.
        </div>
      )}

      {isError && (
        <div className="upload-message error">
          Upload failed:{" "}
          {error?.response?.data?.message ||
            error?.message ||
            "Something went wrong."}
        </div>
      )}
    </section>
  );
}

export default DocumentUpload;
