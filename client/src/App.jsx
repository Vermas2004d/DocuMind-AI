import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";

import { useDocuments } from "./hooks/useDocuments.js";
import DocumentUpload from "./components/DocumentUpload.jsx";
import Chat from "./components/Chat.jsx";

function App() {
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const queryClient = useQueryClient();

  const {
    data: documents = [],
    isLoading,
    isError,
  } = useDocuments(isAuthenticated);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          credential: credentialResponse.credential,
        }
      );

      const { token, user: userData } = response.data;

      if (!token) {
        throw new Error("Authentication token was not received");
      }

      localStorage.setItem("token", token);

      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google login failed");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setUser(null);
    setSelectedDocumentId(null);

    queryClient.clear();
  };

  const selectedDocument = documents.find(
    (document) => document._id === selectedDocumentId
  );

  if (!isAuthenticated) {
    return (
      <div className="app">
        <main className="auth-page">
          <div className="auth-card">
            <div className="brand-mark">✦</div>

            <h1>DocuMind AI</h1>

            <p className="auth-subtitle">
              Intelligent Document Q&A with RAG
            </p>

            <div className="auth-divider" />

            <h2>Ask your documents anything</h2>

            <p className="auth-description">
              Upload your PDFs, let AI understand them, and get
              accurate answers with relevant sources.
            </p>

            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleLoginError}
              />
            </div>

            <p className="auth-footer">
              Secure authentication powered by Google
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">✦</div>

          <div>
            <h1>DocuMind AI</h1>
            <span>Intelligent Document Q&A</span>
          </div>
        </div>

        <div className="navbar-user">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name || "User"}
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <div className="user-info">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email}</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR AI WORKSPACE</p>

            <h2>
              Welcome back
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </h2>

            <p>
              Upload a document and start asking intelligent
              questions about it.
            </p>
          </div>

          <div className="document-count">
            <strong>{documents.length}</strong>
            <span>
              {documents.length === 1
                ? "Document"
                : "Documents"}
            </span>
          </div>
        </section>

        <DocumentUpload />

        <section className="documents-section">
          <div className="documents-header">
            <div>
              <p className="eyebrow">YOUR LIBRARY</p>
              <h2>Your Documents</h2>
            </div>

            <span className="document-total">
              {documents.length}{" "}
              {documents.length === 1
                ? "document"
                : "documents"}
            </span>
          </div>

          {isLoading && (
            <div className="documents-state">
              <div className="documents-spinner" />
              <p>Loading your documents...</p>
            </div>
          )}

          {isError && (
            <div className="documents-state error-state">
              <div className="state-icon">!</div>
              <h3>Unable to load documents</h3>
              <p>
                Something went wrong while fetching your
                documents.
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            documents.length === 0 && (
              <div className="documents-state">
                <div className="state-icon">PDF</div>
                <h3>Your library is empty</h3>
                <p>
                  Upload your first PDF above to start using
                  DocuMind AI.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            documents.length > 0 && (
              <div className="document-grid">
                {documents.map((document) => (
                  <div
                    className={`document-card ${
                      selectedDocumentId === document._id
                        ? "selected"
                        : ""
                    }`}
                    key={document._id}
                  >
                    <div className="document-card-top">
                      <div className="document-icon">
                        PDF
                      </div>

                      <span
                        className={`status-badge ${document.status}`}
                      >
                        <span />
                        {document.status === "ready"
                          ? "Ready"
                          : document.status === "processing"
                          ? "Processing"
                          : document.status}
                      </span>
                    </div>

                    <div className="document-info">
                      <h3 title={document.fileName}>
                        {document.fileName}
                      </h3>

                      <p>
                        {(document.fileSize / 1024 / 1024).toFixed(
                          2
                        )}{" "}
                        MB
                      </p>
                    </div>

                    <button
                      className="ask-document-button"
                      disabled={document.status !== "ready"}
                      onClick={() =>
                        setSelectedDocumentId(document._id)
                      }
                    >
                      {document.status === "ready"
                        ? "Ask Questions →"
                        : "Processing..."}
                    </button>
                  </div>
                ))}
              </div>
            )}
        </section>

        {selectedDocumentId && (
          <section className="chat-section-wrapper">
            <div className="active-document">
              <div>
                <span>ASKING ABOUT</span>
                <strong>
                  {selectedDocument?.fileName ||
                    "Selected document"}
                </strong>
              </div>

              <button
                onClick={() => setSelectedDocumentId(null)}
              >
                Close
              </button>
            </div>

            <Chat documentId={selectedDocumentId} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <span>DocuMind AI</span>
        <span>•</span>
        <span>Powered by RAG</span>
      </footer>
    </div>
  );
}

export default App;