
import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";

import { useDocuments } from "./hooks/useDocuments.js";
import DocumentUpload from "./components/DocumentUpload.jsx";
import Chat from "./components/Chat.jsx";

function App() {
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem("token"))
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
      console.log("Google credential received:", Boolean(credentialResponse?.credential));
      console.log("Calling backend auth");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          credential: credentialResponse.credential,
        }
      );

      console.log("Auth response received:", response.status);
      console.log("Auth success:", response.data?.success);
      console.log("JWT received:", Boolean(response.data?.token));

      const { token, user: userData } = response.data;

      if (token) {
        // Store JWT
        localStorage.setItem("token", token);

        // Store user information
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }

        setIsAuthenticated(true);
        console.log("Login successful");
      }
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

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>DocuMind AI</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280" }}>Intelligent Document Q&A with RAG</p>
        </div>

        {isAuthenticated && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user?.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.name || "User"}
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
              />
            )}
            {user?.name && (
              <span style={{ fontWeight: 600, fontSize: "14px" }}>{user.name}</span>
            )}
            <button
              onClick={handleLogout}
              style={{
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Log out
            </button>
          </div>
        )}
      </header>

      {/* Google Authentication */}
      {!isAuthenticated && (
        <div style={{ background: "white", padding: "40px 24px", borderRadius: "16px", border: "1px solid #e5e7eb", textAlign: "center", maxWidth: "450px", margin: "60px auto" }}>
          <h2 style={{ marginTop: 0, marginBottom: "12px" }}>Login to continue</h2>
          <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "14px" }}>Sign in with your Google account to access and ask questions to your documents.</p>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleLoginError}
            />
          </div>
        </div>
      )}

      {/* Application */}
      {isAuthenticated && (
        <>
          <DocumentUpload />

          <hr style={{ margin: "32px 0", borderColor: "#e5e7eb" }} />

          <h2>Your Documents</h2>

          {isLoading && (
            <p>Loading documents...</p>
          )}

          {isError && (
            <p style={{ color: "#dc2626" }}>Failed to load documents.</p>
          )}

          {!isLoading &&
            documents.length === 0 && (
              <p style={{ color: "#6b7280" }}>No documents uploaded yet.</p>
            )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", margin: "16px 0" }}>
            {documents.map((document) => (
              <div
                key={document._id}
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: "16px", wordBreak: "break-all" }}>{document.fileName}</h3>

                <p style={{ margin: "4px 0", fontSize: "13px", color: "#4b5563" }}>
                  Status:{" "}
                  <strong style={{ textTransform: "capitalize" }}>{document.status}</strong>
                </p>

                <p style={{ margin: "4px 0 12px", fontSize: "13px", color: "#6b7280" }}>
                  Size:{" "}
                  {(
                    document.fileSize /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>

                <button
                  disabled={document.status !== "ready"}
                  onClick={() => {
                    setSelectedDocumentId(
                      document._id
                    );
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: document.status === "ready" ? "#111827" : "#e5e7eb",
                    color: document.status === "ready" ? "white" : "#9ca3af",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "13px"
                  }}
                >
                  {document.status === "ready"
                    ? "Ask Questions"
                    : "Processing..."}
                </button>
              </div>
            ))}
          </div>

          <hr style={{ margin: "32px 0", borderColor: "#e5e7eb" }} />

          {selectedDocumentId && (
            <Chat
              documentId={selectedDocumentId}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;

