# Barber – GCSE OCR Computer Science AI Tutor

An AI-powered tutoring platform for GCSE OCR Computer Science (Specification J277), built with:

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Authentication**: PocketBase
- **Backend**: Express.js + OpenAI SDK (AI tutoring)

## Features

- 🔐 **PocketBase Authentication** – Secure login and registration
- 📚 **8 GCSE Topics** – All aligned to OCR Spec J277
- 🤖 **AI Chat Tutor** – Ask any GCSE CS question, get exam-focused answers
- 💡 **Concept Explanations** – Click any subtopic for an instant AI explanation
- ✏️ **AI-Generated Quizzes** – Multiple choice questions with explanations
- 📝 **Answer Feedback** – Submit practice answers and get marked feedback

## GCSE Topics Covered

1. Components of Computer Systems (CPU, memory, storage, Boolean logic)
2. Software & Software Development (OS, languages, compilers, SDLC)
3. Exchanging Data (networks, encryption, databases, SQL)
4. Data Types, Structures & Algorithms (arrays, searching, sorting)
5. The Internet (IP, DNS, cybersecurity, cloud)
6. Implications of Digital Technology (ethics, law, GDPR)
7. Programming (Python: variables, loops, functions)
8. Algorithms (pseudocode, flowcharts, trace tables)

## Project Structure

```
barber/
├── frontend/          # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Login & Register pages
│   │   │   └── (dashboard)/  # Dashboard, Topics, Chat, Quiz
│   │   ├── contexts/         # AuthContext (PocketBase)
│   │   └── lib/              # PocketBase client, API helpers
│   └── package.json
├── backend/           # Express.js AI server (port 3001)
│   ├── src/
│   │   ├── index.js          # Express app entry
│   │   ├── middleware/auth.js # PocketBase token validation
│   │   └── routes/ai.js      # OpenAI endpoints
│   └── package.json
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- [PocketBase](https://pocketbase.io/docs/) (download the binary)
- OpenAI API key

### 1. PocketBase

Download and run PocketBase:
```bash
./pocketbase serve
```

Go to `http://localhost:8090/_/` and create:
- A **users** collection with fields: `name` (text), `email` (email), `password`
- Enable email/password authentication

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set OPENAI_API_KEY
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local if needed
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

All `/api/ai/*` endpoints require a `Authorization: Bearer <pocketbase_token>` header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/ai/topics` | List all GCSE topics |
| POST | `/api/ai/chat` | AI chat message |
| POST | `/api/ai/explain` | Explain a concept |
| POST | `/api/ai/quiz` | Generate quiz questions |
| POST | `/api/ai/feedback` | Get answer feedback |
