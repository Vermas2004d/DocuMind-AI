# DocuMind AI

> **Intelligent Document Q&A with RAG**

DocuMind AI is a web application that lets users upload PDF documents and ask questions about their content using AI. The application uses Retrieval-Augmented Generation (RAG) to retrieve relevant information from uploaded documents before generating an answer.

## ✨ Features

- 🔐 Google Sign-In
- 📄 PDF document upload
- ☁️ Secure document storage with AWS S3
- 🤖 AI-powered document Q&A
- 🔎 Semantic search using vector embeddings
- 📚 Source references with page information
- 💬 Persistent chat history
- ⚡ Fast responses with Redis caching
- 🛡️ API rate limiting
- 📱 Responsive user interface

## 🏗️ Technology Stack

| Technology | Used for |
|---|---|
| React | User interface |
| TanStack Query | Server-state management |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB Atlas | Users, document metadata and chat history |
| AWS S3 | PDF storage |
| Redis | Caching and rate limiting |
| LangChain | RAG pipeline |
| Gemini | Embeddings and AI responses |
| Qdrant | Vector storage and similarity search |
| Vercel | Frontend deployment |
| Render | Backend deployment |

## 🔄 How It Works

### Document Upload

```text
User
  ↓
Upload PDF
  ↓
React Frontend
  ↓
Express API
  ↓
AWS S3
  ↓
PDF Processing
  ↓
Text Splitting
  ↓
Gemini Embeddings
  ↓
Qdrant Vector Database
```

The original PDF is stored in AWS S3 while its metadata is stored in MongoDB.

### Asking a Question

```text
User Question
     ↓
React
     ↓
Express API
     ↓
Authentication
     ↓
Redis Cache Check
     ↓
Qdrant Similarity Search
     ↓
Relevant Document Chunks
     ↓
Gemini
     ↓
AI Answer + Sources
     ↓
React UI
```

If the same question has already been answered for the same user and document, Redis can return the cached response instead of running the complete RAG pipeline again.

## 🧠 RAG Pipeline

DocuMind AI uses Retrieval-Augmented Generation to ground AI responses in the uploaded document.

```text
PDF
 ↓
Extract Text
 ↓
Split into Chunks
 ↓
Generate Embeddings
 ↓
Store Vectors in Qdrant
```

When a user asks a question:

```text
Question
 ↓
Question Embedding
 ↓
Qdrant Similarity Search
 ↓
Relevant Chunks
 ↓
Gemini LLM
 ↓
Grounded Answer
```

The retrieved chunks contain metadata such as the document ID, file name and page number, allowing the application to display sources alongside the answer.

## 🔐 Authentication

DocuMind AI uses Google Sign-In and application JWT authentication.

```text
User
 ↓
Google Sign-In
 ↓
Google ID Token
 ↓
Backend Verification
 ↓
JWT Generated
 ↓
Protected API Requests
```

The JWT is used to authenticate requests to protected document and chat APIs.

## ⚡ Performance

Redis is used in two important areas:

### Response Caching

Frequently repeated questions can be served from Redis without running another vector search and LLM request.

### Rate Limiting

The API uses Redis to limit repeated requests and help protect the backend from excessive usage.

## ☁️ Deployment Architecture

```text
                 Internet
                    │
          ┌─────────┴─────────┐
          │                   │
       Vercel              Render
     React App          Node + Express
                              │
             ┌────────────────┼────────────────┐
             │                │                │
        MongoDB Atlas     Redis Cloud      Qdrant Cloud
             │
          AWS S3
             │
        Gemini APIs
```

The frontend is hosted on Vercel and the backend is hosted on Render. Managed cloud services are used for the application's database, cache, vector database and document storage.

## 📂 Project Structure

```text
DocuMind-AI/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .gitignore
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   └── .gitignore
│
├── docker-compose.yml
├── README.md
└── DocuMind_AI_Architecture_and_Flows.pdf
```

## 📖 Complete Architecture & Flow Documentation

For the complete system architecture, RAG pipeline, authentication flow, document upload flow, Redis caching, rate limiting, chat history, API flow and deployment architecture:

### 👉 [Download the Complete Architecture & Flows PDF](./DocuMind_AI_Architecture_and_Flows.pdf)

You can also open the PDF directly from the repository.

## 🚀 Local Development

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Create the required environment variables before running the application.

### Client environment

```env
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=
```

### Server environment

```env
PORT=
MONGO_URI=
GOOGLE_CLIENT_ID=
JWT_SECRET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
GEMINI_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
REDIS_URL=
CLIENT_URL=
```

**Never commit `.env` files or secret credentials to GitHub.**

## 📌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/google` | Google authentication |
| `GET` | `/api/documents` | Get user's documents |
| `POST` | `/api/documents/upload` | Upload and process a PDF |
| `POST` | `/api/chat/ask` | Ask a question about a document |
| `GET` | `/api/chat/:documentId` | Get chat history |
| `GET` | `/api/health` | Backend health check |

## 📄 License

This project is intended as a personal software project and demonstration application.
