# SadikGPT – Full-Stack GPT Clone

A ChatGPT-style web app. Users register, log in, create chats and talk to an AI assistant powered by Google Gemini. Every user sees only their own chats.

- **Frontend (live):** https://sadiksgptclone.netlify.app
- **Backend (live):**https://gpt-clone-production-904e.up.railway.app

---

## Features

- Register, log in, log out (JWT authentication, passwords hashed with bcrypt)
- Session restore after page refresh (`/api/auth/me`)
- Multiple chats per user: create, list, open, rename, delete
- Chat title is created automatically from the first question
- AI replies with conversation history as context (last 10 messages of the chat)
- Markdown and syntax-highlighted code in replies
- Token usage saved with every assistant reply
- Responsive layout with a collapsible sidebar

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, react-markdown, lucide-react |
| Backend | Node.js (ES modules), Express 5, express-validator, JWT, bcryptjs |
| Database | MySQL (`mysql2`) |
| AI | Google Gemini (`@google/genai`) |
| Hosting | Netlify (frontend), Railway (backend + MySQL) |

## Project structure

```
gpt_clone/
├── frontend/
│   ├── public/                 
│   └── src/
│       ├── api/client.js       handling
│       ├── components/          
│       ├── context/            
│       ├── pages/              
│       └── App.jsx             
└── backend/
    ├── index.js                
    ├── db/
    │   ├── 2,db.config.js       
    │   ├── migrate.js         
    │   └── migrations/        
    └── src/
        ├── api/
        │   ├── auth/            
        │   └── chat/            
        ├── middleware/          
        └── utils/errors/       
```

---

## Database

Three tables. **Column names matter**: the code uses `users.user_id` (not `id`).

```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (email = LOWER(email))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'New chat',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_chats_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_chats_user_updated (user_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  token_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conv_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  INDEX idx_conversations_chat (chat_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Relationships: `users` 1 → N `chats` 1 → N `conversations`. Deleting a user deletes their chats, and deleting a chat deletes its messages (`ON DELETE CASCADE`).

**Important:** `CREATE TABLE IF NOT EXISTS` never changes a table that already exists. If an old table with different columns is already in the database, it is silently skipped. When the schema changes, write a migration that uses `ALTER TABLE`, or drop and recreate the table if the data is disposable.

---

## Environment variables

### Backend (`backend/.env`)

```env
PORT=3888

DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_DATABASE=your-database-name

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=your-gemini-model-name

JWT_SECRET=a-long-random-secret
JWT_EXPIRES_IN=1d

FRONTEND_URL=https://sadiksgptclone.netlify.app
```

`JWT_SECRET` is required. The server refuses to start without it.

On Railway, set the same variables in the backend service's **Variables** tab. Railway usually provides its own `PORT`.

### Frontend (`frontend/.env`)

```env
# Local development
VITE_API_URL=http://localhost:3888

# Production (set this in Netlify instead)
# VITE_API_URL=https://gpt-clone-production-904e.up.railway.app
```

Use the URL with no trailing slash. Vite reads this value at **build time**, so after changing it in Netlify you must trigger a new deploy.

> Never commit `.env` files. If a secret was ever pushed to GitHub, create a new one and delete the old one.

---

## Run locally

Requirements: Node.js 18+ and a MySQL server.

```bash
# 1. Clone
git clone <your-repo-url>
cd gpt_clone

# 2. Create the database and tables
#    (create an empty database, then run the SQL from the "Database" section)

# 3. Backend
cd backend
npm install
# create backend/.env (see above)
npm run dev          # http://localhost:3888

# 4. Frontend (new terminal)
cd frontend
npm install
# create frontend/.env (see above)
npm run dev          # http://localhost:5173
```

Backend scripts: `npm start` (production), `npm run dev` (nodemon).
Frontend scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.

---

## API reference

All responses are JSON. Routes marked 🔒 need the header `Authorization: Bearer <token>`.

### Auth (`/api/auth`)

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `firstName`, `lastName`, `email`, `password` | Create an account |
| POST | `/api/auth/login` | `email`, `password` | Returns `user` and `token` |
| GET | `/api/auth/me` 🔒 | – | Current user (restores the session) |

Validation rules:

| Field | Rule |
| --- | --- |
| `firstName`, `lastName` | Required, text, at least 3 characters |
| `email` | Required, valid email (normalized, and stored in lowercase) |
| `password` | Required, at least 6 characters (login only checks that it is not empty) |

### Chats (`/api/chat`)

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| POST | `/api/chat/chats` 🔒 | `title` (optional, max 255) | Create a chat |
| GET | `/api/chat/chats` 🔒 | – | List your chats (newest activity first, max 100) |
| GET | `/api/chat/chats/:chatId/messages` 🔒 | – | All messages of one chat |
| POST | `/api/chat/chats/:chatId/messages` 🔒 | `question` (1–4000 chars) | Ask a question; returns the saved user and assistant messages |
| PATCH | `/api/chat/chats/:chatId` 🔒 | `title` | Rename a chat |
| DELETE | `/api/chat/chats/:chatId` 🔒 | – | Delete a chat and its messages |

Errors use this shape: `{ "success": false, "message": "..." }`. Server errors (500+) return a generic message to the user. The real cause is written to the server logs.

---

## How a message is processed

1. The browser sends the question to `POST /api/chat/chats/:chatId/messages`.
2. The backend checks that the chat belongs to the logged-in user.
3. It loads the last 10 messages of that chat as context and asks Gemini for a reply.
4. If Gemini succeeds, both messages are saved in one database transaction and the chat's `updated_at` is refreshed. If Gemini fails, nothing is saved.
5. The first question of a new chat becomes the chat title.

---

## Deployment

### Backend and MySQL on Railway

1. Create a Railway project with a **MySQL** service and a service for the backend repo (set the root directory to `backend`).
2. Add the variables from the backend `.env` section to the backend service. Use the MySQL service's connection details for the `DB_*` values.
3. Create the tables in the Railway MySQL query tab. Run **one statement at a time**, because the query box does not accept several statements together.
4. Push to GitHub. Railway redeploys automatically. Check **Deploy Logs** for `Database connected successfully!`.

### Frontend on Netlify

1. Connect the repo, set the base directory to `frontend`, the build command to `npm run build` and the publish directory to `dist`.
2. Set `VITE_API_URL` to your Railway backend URL.
3. Add `frontend/public/_redirects` with this single line so page refreshes on `/login` or `/register` don't return 404:
   ```
   /*    /index.html   200
   ```

---

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| `Unknown column 'user_id' in 'field list'` | The database table does not match the code (for example an old `users` table with `id` and `username`). Compare with the SQL in the **Database** section and recreate the table. |
| Register works locally but returns 500 on the live site | The live database has a different schema than your local one, or the live backend runs older code. Check Railway logs and the latest deployed commit. |
| "Cannot reach the server" | The backend is redeploying or crashed, the CORS setting rejects your frontend, or `VITE_API_URL` is wrong. Open the backend URL in a browser and read the Deploy Logs. |
| 404 on `/register` after refresh | Missing `_redirects` file on Netlify (see above). |
| Query box says "error in your SQL syntax" | Railway's query box runs only one statement at a time. |
| Foreign key creation fails | The two columns must have exactly the same type and signedness (for example `INT` and `INT`). |
| Server crashes on startup | `JWT_SECRET` is missing in the environment variables. |
| Logs show `error in request: ...` | Read the line above it. The error handler prints the HTTP method, URL, failing SQL and SQL message. |

---

## Known issues and to-do

- Remove the old routes `POST/GET /api/chat/conversations` and the functions `createConversationService` and `getRecentConversationRows`. They are not protected by login and they write messages without a `chat_id`.
- Remove the unused `backend/src/controllers/auth.controller.js` (an older version that used `username`).
- Keep one source of truth for the schema: update `db/schema.sql` or the migration files so they always match the code.
- The CORS handler currently allows every origin. To restrict it, replace `callback(null, true)` in the `else` branch with `callback(new Error('Not allowed by CORS'))`.
- Add rate limiting to the login and register routes.
- Names must currently be at least 3 characters, so short names such as "Al" or "Li" are rejected. Consider lowering `min: 3` to `min: 2` in `auth.validation.js`.
- `/api/admin` is commented out in `6,main.routes.js` and not implemented yet.

---

## Author

**Sadik** – Full-stack developer (React, Node.js, Express, MySQL, AI API integration).