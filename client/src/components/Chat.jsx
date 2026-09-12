import { useEffect, useRef, useState } from "react";
import { useAskQuestion } from "../hooks/useAskQuestion.js";
import { useChatHistory } from "../hooks/useChatHistory.js";

function Chat({ documentId }) {
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef(null);

  const {
    data: messages = [],
    isLoading: isHistoryLoading,
  } = useChatHistory(documentId);

  const {
    mutate: askQuestion,
    data,
    isPending,
    isError,
    error,
  } = useAskQuestion();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, data, isPending]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!question.trim() || !documentId || isPending) {
      return;
    }

    askQuestion({
      question: question.trim(),
      documentId,
    });

    setQuestion("");
  };

  return (
    <section className="chat-section">
      <div className="chat-header">
        <div>
          <div className="chat-title-row">
            <div className="ai-icon">✦</div>

            <div>
              <h2>Ask your document</h2>
              <p>
                Ask anything about the information inside this document.
              </p>
            </div>
          </div>
        </div>

        <div className="online-badge">
          <span></span>
          AI Ready
        </div>
      </div>

      <div className="chat-window">
        {isHistoryLoading && (
          <div className="chat-loading">
            <div className="spinner"></div>
            <span>Loading conversation...</span>
          </div>
        )}

        {!isHistoryLoading && messages.length === 0 && !data && (
          <div className="empty-chat">
            <div className="empty-icon">✦</div>

            <h3>Start a conversation</h3>

            <p>
              Ask a question about your document and DocuMind AI
              will find the relevant information for you.
            </p>

            <div className="suggestion-list">
              <button
                type="button"
                onClick={() =>
                  setQuestion("What is this document about?")
                }
              >
                What is this document about?
              </button>

              <button
                type="button"
                onClick={() =>
                  setQuestion("Summarize the main points")
                }
              >
                Summarize the main points
              </button>

              <button
                type="button"
                onClick={() =>
                  setQuestion("What are the important instructions?")
                }
              >
                What are the important instructions?
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`message-row ${
              message.role === "user"
                ? "user-message"
                : "assistant-message"
            }`}
          >
            <div className="message-avatar">
              {message.role === "user" ? "You" : "✦"}
            </div>

            <div className="message-content">
              <div className="message-role">
                {message.role === "user"
                  ? "You"
                  : "DocuMind AI"}
              </div>

              <div className="message-bubble">
                {message.content}
              </div>

              {message.role === "assistant" &&
                message.sources?.length > 0 && (
                  <div className="sources">
                    <div className="sources-title">
                      Sources
                    </div>

                    <div className="source-list">
                      {message.sources.map(
                        (source, sourceIndex) => (
                          <div
                            className="source-card"
                            key={`${source.documentId}-${sourceIndex}`}
                          >
                            <div className="source-icon">
                              PDF
                            </div>

                            <div>
                              <strong>
                                {source.fileName}
                              </strong>

                              <span>
                                Page{" "}
                                {source.page ?? "Unknown"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="message-row assistant-message">
            <div className="message-avatar">✦</div>

            <div className="message-content">
              <div className="message-role">
                DocuMind AI
              </div>

              <div className="message-bubble typing-bubble">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {isError && (
          <div className="error-message">
            <strong>Something went wrong</strong>
            <span>
              {error?.response?.data?.message ||
                error?.message ||
                "Failed to get an answer."}
            </span>
          </div>
        )}

        {data && messages.length === 0 && (
          <div className="message-row assistant-message">
            <div className="message-avatar">✦</div>

            <div className="message-content">
              <div className="message-role">
                DocuMind AI
              </div>

              <div className="message-bubble">
                {data.answer}
              </div>

              {data.sources?.length > 0 && (
                <div className="sources">
                  <div className="sources-title">
                    Sources
                  </div>

                  <div className="source-list">
                    {data.sources.map(
                      (source, index) => (
                        <div
                          className="source-card"
                          key={`${source.documentId}-${index}`}
                        >
                          <div className="source-icon">
                            PDF
                          </div>

                          <div>
                            <strong>
                              {source.fileName}
                            </strong>

                            <span>
                              Page{" "}
                              {source.page ?? "Unknown"}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        className="chat-input-area"
        onSubmit={handleSubmit}
      >
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask anything about your document..."
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            disabled={isPending}
          />

          <button
            type="submit"
            disabled={!question.trim() || isPending}
            aria-label="Ask question"
          >
            {isPending ? "..." : "↑"}
          </button>
        </div>

        <p className="input-hint">
          DocuMind AI answers using information retrieved from
          your document.
        </p>
      </form>
    </section>
  );
}

export default Chat;