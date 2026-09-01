# GPT-Clone Backend

A Node.js/Express backend that stores chat conversations in MySQL and generates
assistant replies using the Google Gemini API.

## Tech Stack

- **Runtime:** Node.js (ESM modules)
- **Framework:** Express.js
- **Database:** MySQL (via `mysql2/promise`)
- **AI Provider:** Google Gemini (`@google/genai`)
- **Other:** `cors`, `dotenv`

## Project Structure

```
backend/
├── db/
│   ├── db.config.js       # MySQL connection pool
│   └── schema.sql         # Database schema
├── src/
│   ├── api/
│   │   ├── admin/         # Reserved for future auth/user routes
│   │   ├── chat/
│   │   │   ├── controller/chat.controller.js
│   │   │   ├── service/chat.service.js
│   │   │   └── chat.routes.js
│   │   └── main.routes.js # Aggregates all feature routers
│   └── middleware/
│       └── error-handler.js
├── .env                    # Environment variables (not committed)
├── .gitignore
├── index.js                 # App entrypoint
└── package.json
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create the database**
   ```bash
   mysql -u root -p -e "CREATE DATABASE `chatgpt-clone`;"
   mysql -u root -p chatgpt-clone < db/schema.sql
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your own values:
   ```env
   # MySQL
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=chatgpt-clone

   # Gemini
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.0-flash-lite
   ```
   Never commit a real `.env` file — it's already listed in `.gitignore`.

4. **Run the server**
   ```bash
   node index.js
   ```
   The server starts on `http://localhost:3888`.

## API Endpoints

Base path: `/api/chat`

| Method | Path            | Description                                  |
|--------|-----------------|-----------------------------------------------|
| POST   | `/conversations` | Send a question, get back the saved user + assistant messages |
| GET    | `/conversations` | Fetch the last 100 messages                   |

### POST `/api/chat/conversations`
**Request body**
```json
{ "question": "What is the capital of France?" }
```
**Response**
```json
{
  "success": true,
  "message": "conversation posted successfully",
  "data": {
    "userConversation": { "id": 1, "role": "user", "content": "...", "tokenCount": 0, "createdAt": "..." },
    "assistantConversation": { "id": 2, "role": "assistant", "content": "...", "tokenCount": 42, "createdAt": "..." }
  }
}
```

### GET `/api/chat/conversations`
Returns the last 100 messages, oldest first.

## Architecture Notes

- All chat history currently lives in a single shared `conversations` table with
  no `user_id` or `conversation_id` — this is a single-user, single-thread MVP.
  Multi-user/multi-thread support requires a schema change before auth is added.
- Errors are passed via `next(error)` to the centralized `errorHandler` middleware,
  which respects `err.status` (defaulting to 500) and returns a consistent JSON shape.

## Roadmap

- [❌] Add `users` table + authentication
- [❌] Add `conversation_id` to support multiple chat threads per user
- [❌] Request validation middleware
- [❌] Automated tests

