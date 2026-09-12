import { useState } from "react";
import { useAskQuestion } from "../hooks/useAskQuestion.js";

function Chat({ documentId }) {
  const [question, setQuestion] = useState("");

  const {
    mutate: askQuestion,
    data,
    isPending,
    isError,
    error,
  } = useAskQuestion();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!question.trim() || !documentId) {
      return;
    }

    askQuestion({
      question: question.trim(),
      documentId,
    });
  };

  return (
    <div>
      <h2>Ask about this document</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);
          }}
          disabled={isPending}
        />

        <button
          type="submit"
          disabled={!question.trim() || isPending}
        >
          {isPending ? "Thinking..." : "Ask"}
        </button>
      </form>

      {isError && (
        <p>
          Error:{" "}
          {error?.response?.data?.message || error.message}
        </p>
      )}

      {data && (
        <div>
          <h3>Answer</h3>

          <p>{data.answer}</p>

          {data.sources?.length > 0 && (
            <div>
              <h4>Sources</h4>

              {data.sources.map((source, index) => (
                <div key={`${source.documentId}-${index}`}>
                  <p>
                    <strong>{source.fileName}</strong>
                  </p>

                  <p>
                    Page: {source.page ?? "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Chat;