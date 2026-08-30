# GPT Clone — Backend

A lightweight Node.js/Express backend that powers a ChatGPT-style conversational app. It stores chat history in MySQL and generates AI responses using Google's Gemini API, complete with conversation context/history for coherent multi-turn chats.

## Features

- 💬 **Conversational API** — Post a question and receive an AI-generated answer with full conversation persistence.
- 🧠 **Context-aware responses** — Automatically includes recent conversation history when generating replies via Gemini.
- 🗄️ **MySQL persistence** — All user questions and assistant answers are stored with role, content, token count, and timestamps.
- ⚡ **Google Gemini integration** — Uses `@google/genai` for response generation, with configurable model via environment variables.
- 🛡️ **Centralized error handling** — Custom middleware for consistent error responses across the API.
- 📦 **Modular structure** — Clean separation of routes, controllers, services, and middleware for easy scaling.

## Tech Stack

| Layer            | Technology            |
|-------------------|------------------------|
| Runtime            | Node.js                |
| Framework          | Express.js             |
| Database           | MySQL (`mysql2`)       |
| AI Provider        | Google Gemini (`@google/genai`) |
| Environment Config | dotenv                 |

## Project Structure

```
backend/
├── db/
│   └── db.config.js              # MySQL connection pool setup
├── src/
│   ├── api/
│   │   ├── admin/                 # Admin-related routes (WIP)
│   │   ├── chat/
│   │   │   ├── controller/
│   │   │   │   └── chat.controller.js   # Request handlers for chat endpoints
│   │   │   ├── service/
│   │   │   │   └── chat.service.js      # Business logic + Gemini integration
│   │   │   └── chat.routes.js           # /api/chat routes
│   │   └── main.routes.js               # Root API router
│   ├── middleware/
│   │   └── error-handler.js             # Global error-handling middleware
│   └── utilitis/                        # Shared utility functions
├── .env                          # Environment variables (not committed)
├── .gitignore
├── index.js                      # App entry point
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL database instance
- A Google Gemini API key

### Installation

```bash
git clone <your-repo-url>
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3888

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

### Database Setup

Create a `conversations` table:

```sql
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  token_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Run the Server

```bash
node index.js
```

The server will start on `http://localhost:3888` (or the port set in `.env`).

## API Reference

Base URL: `/api/chat`

### Create a Conversation

Sends a question and receives an AI-generated answer. Both the question and the answer are saved to the database.

```
POST /api/chat/conversations
```

**Request Body**
```json
{
  "question": "What is the capital of France?"
}
```

**Response — `201 Created`**
```json
{
  "success": true,
  "message": "conversation posted successfully",
  "Data": {
    "userConversation": {
      "id": 1,
      "role": "user",
      "content": "What is the capital of France?",
      "tokenCount": 0,
      "createdAt": "2026-08-30T10:00:00.000Z"
    },
    "assistantConversation": {
      "id": 2,
      "role": "assistant",
      "content": "The capital of France is Paris.",
      "tokenCount": 12,
      "createdAt": "2026-08-30T10:00:01.000Z"
    }
  }
}
```

### Get Recent Conversations

Fetches the most recent conversation messages (default limit: 100), ordered chronologically.

```
GET /api/chat/conversations
```

**Response — `200 OK`**
```json
{
  "success": true,
  "message": "Conversations fetched successfully.",
  "data": [
    {
      "id": 1,
      "role": "user",
      "content": "What is the capital of France?",
      "created_at": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

## Error Handling

All errors are caught and formatted by a centralized middleware, returning a consistent JSON shape:

```json
{
  "status": false,
  "message": "error message here"
}
```

## Roadmap

- [ ] Complete admin module
- [ ] Add authentication/authorization
- [ ] Add pagination to conversation history
- [ ] Add unit/integration tests
- [ ] Add streaming responses support

## License

This project is currently unlicensed. Add a license of your choice before publishing publicly.
