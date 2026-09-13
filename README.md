# DocuMind AI

> **Intelligent Document Q&A with RAG**

DocuMind AI is a production-style MERN application that lets authenticated users upload PDF documents and ask natural-language questions about their content. It combines **RAG (Retrieval-Augmented Generation)** with Gemini, LangChain and Qdrant, while using MongoDB for application data, Redis for caching/rate limiting, and AWS S3 for private document storage.

## 🚀 Live Architecture

```text
Internet
   |
   +--> Vercel
   |     React + TanStack Query
   |
   | HTTPS / REST
   v
Render
Node.js + Express
   |
   +--> MongoDB Atlas  -> users, document metadata/status, chat history
   +--> Redis Cloud    -> RAG cache + rate limiting
   +--> AWS S3         -> private original PDFs
   +--> LangChain RAG
          +--> PDF loader
          +--> text splitting
          +--> Gemini embeddings
          +--> Qdrant Cloud -> vector search
          +--> Gemini LLM   -> grounded answers
```

The backend is the orchestrator. MongoDB and Qdrant do not communicate directly.

## ✨ Features

- Google authentication
- Application JWT authentication and protected APIs
- PDF upload with a 10 MB limit
- Private AWS S3 document storage
- PDF ingestion and chunking
- Gemini embeddings
- Qdrant vector search
- RAG-based document Q&A
- Source/page metadata in answers
- Redis response caching
- Redis per-user rate limiting
- Persistent chat history in MongoDB
- TanStack Query for server-state management
- Production deployment with Vercel + Render + managed data services
- Responsive frontend

## 🧠 RAG Flow

```text
PDF
  ↓
PDF loader
  ↓
Recursive text splitter
  ↓
Chunks + document/user/page metadata
  ↓
Gemini embeddings
  ↓
Qdrant
```

Question flow:

```text
User question
  ↓
JWT authentication
  ↓
Redis rate limit
  ↓
MongoDB document ownership check
  ↓
Redis cache lookup
  ├── HIT  → cached answer
  └── MISS
        ↓
     Qdrant similarity search
     filtered by userId + documentId
        ↓
     Top relevant chunks
        ↓
     Grounded prompt
        ↓
     Gemini LLM
        ↓
     Answer + sources
        ↓
     Redis cache + MongoDB chat history
        ↓
     React UI
```

## 🔐 Authentication Flow

```text
React
  ↓
Google Identity Services
  ↓
Google ID token
  ↓
POST /api/auth/google
  ↓
Backend verifies token
  ↓
Find/create MongoDB user
  ↓
Backend signs application JWT
  ↓
React stores JWT
  ↓
Authorization: Bearer <JWT>
```

The backend never trusts a browser-supplied user ID for protected resources. It derives the user identity from the verified JWT.

## ⚡ Redis

### Cache

Cache key:

```text
rag:<userId>:<documentId>:<questionHash>
```

The question is normalized and hashed with SHA-256. Cached RAG results have a TTL.

### Rate limiting

The current chat policy is an example:

```text
20 requests / minute / authenticated user
```

The limiter uses Redis `INCR` and `EXPIRE`.

## 🗃️ Data Responsibilities

| Technology | Responsibility |
|---|---|
| React | UI |
| TanStack Query | Server-state management |
| Express | REST API/orchestration |
| MongoDB Atlas | Users, document metadata, chat history |
| Redis Cloud | Cache + rate limiting |
| AWS S3 | Private PDFs |
| LangChain | RAG orchestration |
| Gemini | Embeddings + LLM |
| Qdrant | Vector storage/search |
| Vercel | Frontend hosting |
| Render | Backend hosting |

## 📁 Project Structure

```text
DocuMind-AI/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── .gitignore
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── .env
│   └── .gitignore
└── docker-compose.yml
```

## 🔌 API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/google` | Google login + JWT |
| GET | `/api/documents` | User documents |
| POST | `/api/documents/upload` | Upload + ingest PDF |
| POST | `/api/chat/ask` | RAG question |
| GET | `/api/chat/:documentId` | Chat history |
| GET | `/api/health` | Health check |

## 🛡️ Security

- JWT protected APIs
- User/document ownership checks
- Qdrant filters by `userId` and `documentId`
- Private S3 bucket
- Backend-only secrets
- Redis rate limiting
- Production CORS restriction
- PDF MIME-type validation
- 10 MB upload limit
- Qdrant payload indexes for filtered retrieval

## 🌍 Deployment

```text
Vercel
  ↓ HTTPS
Render
  ├── MongoDB Atlas
  ├── Redis Cloud
  ├── Qdrant Cloud
  └── AWS S3
       |
       +--> Gemini APIs
```

Local Docker Compose is used for development support services. Production uses managed services.

## 🧪 Production Test Checklist

- [ ] Google login
- [ ] JWT-protected API
- [ ] PDF upload
- [ ] S3 storage
- [ ] PDF ingestion
- [ ] Qdrant indexing
- [ ] RAG question
- [ ] Source/page display
- [ ] Redis cache hit on repeated question
- [ ] Redis rate limiting
- [ ] Chat history persistence
- [ ] User/document isolation
- [ ] Production CORS
- [ ] Mobile UI
- [ ] Render/Vercel deployment

## 💬 Interview Explanation

> DocuMind AI is a production-style MERN application for document question answering. Google Identity Services handles authentication, the backend verifies the Google ID token and issues a JWT. PDFs are stored privately in S3, metadata and chat history are stored in MongoDB, and LangChain runs the RAG pipeline. During ingestion, PDFs are split into chunks, enriched with user/document/page metadata, embedded with Gemini and stored in Qdrant. For each question, the backend verifies document ownership, checks Redis for a cached response, performs filtered vector search in Qdrant, and sends the retrieved context to Gemini to generate a grounded answer with sources. Redis also provides per-user rate limiting. The frontend is deployed on Vercel and the backend on Render.

## 📄 Architecture & Flow Guide

The complete architecture, request flows, RAG pipeline, authentication flow, Redis cache/rate-limit flow, deployment architecture and interview explanation are documented here:

**[DocuMind AI — Complete Architecture, Data Flow & Interview Guide](./DocuMind_AI_Architecture_and_Flows.pdf)**

## 🧑‍💻 Local Development

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

Backend health endpoint:

```text
GET /api/health
```

## 🔑 Environment Variables

### Client

```env
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=
```

### Server

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

Never commit `.env` files or backend secrets.

## 📌 Git Checkpoints

Confirmed development checkpoints include:

```text
00b5dab  secure document rag retrieval
a1fa122  add jwt authentication
52227f5  add persistent chat history
de45301  preserve pdf page metadata in rag sources
d418ff0  add redis caching for rag responses
```

---

Built as a portfolio project demonstrating **MERN + RAG + authentication + vector search + caching + rate limiting + cloud deployment**.
