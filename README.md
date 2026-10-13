# 🤖 SadikGPT: Full-Stack GPT Clone

A ChatGPT-style web app. Users register, log in, create chats, and talk to an AI assistant powered by **Google Gemini**. Each user can only see their own chats.

| | Link |
| :--- | :--- |
| 🌐 Frontend | https://sadiksgptclone.netlify.app |
| ⚙️ Backend | #|

## ✨ Features

- Register, log in, and log out (JWT authentication, bcrypt-hashed passwords)
- Session restore after refresh via `/api/auth/me`
- Multiple chats per user: create, list, open, rename, delete
- Chat title is generated from the first question
- AI replies use the last 10 messages of the chat as context
- Markdown and syntax-highlighted code in replies
- Token usage saved with every assistant reply
- Responsive layout with a collapsible sidebar

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 19, Vite, React Router, Axios, react-markdown, lucide-react |
| Backend | Node.js (ES modules), Express 5, express-validator, JWT, bcryptjs |
| Database | MySQL (`mysql2`) |
| AI | Google Gemini (`@google/genai`) |
| Hosting | Netlify (frontend), Railway (backend + MySQL) |

## 📁 Project Structure

```text
gpt_clone/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/client.js      # Axios client
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── App.jsx
└── backend/
    ├── index.js               # Server entry
    ├── db/
    │   ├── db.config.js       # MySQL connection
    │   ├── migrate.js
    │   └── migrations/
    └── src/
        ├── api/
        │   ├── auth/          # Register, login, me
        │   └── chat/          # Chats and messages
        ├── middleware/
        └── utils/errors/
```

## 🚀 Run Locally

**Requirements:** Node.js 18+, a MySQL server, and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone <your-repo-url>
cd gpt_clone
```

**1. Create the database.** Create an empty MySQL database, then run the SQL in [Database](#-database).

**2. Start the backend**

```bash
cd backend
npm install
# create backend/.env (see Environment Variables)
npm run dev        # http://localhost:3888
```

**3. Start the frontend** (new terminal)

```bash
cd frontend
npm install
# create frontend/.env (see Environment Variables)
npm run dev        # http://localhost:5173
```

| Project | Scripts |
| :--- | :--- |
| Backend | `npm start`, `npm run dev` |
| Frontend | `npm run dev`, `npm run build`, `npm run preview`, `npm run lint` |

## 🔐 Environment Variables

**`backend/.env`**

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

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:3888
```

Notes:
- `JWT_SECRET` is required. The server will not start without it.
- Use `VITE_API_URL` with **no trailing slash**. Vite reads it at build time, so redeploy after changing it on Netlify.
- Never commit `.env` files. If a secret was ever pushed to GitHub, create a new one and delete the old one.

## 🗄️ Database

Three tables: `users` → `chats` → `conversations`. Deleting a user deletes their chats, and deleting a chat deletes its messages (`ON DELETE CASCADE`).

> The code uses `users.user_id`, not `id`. Column names must match exactly.

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

> `CREATE TABLE IF NOT EXISTS` never modifies an existing table. If the schema changes, use `ALTER TABLE` in a migration, or drop and recreate the table if the data is disposable.

## 📡 API Reference

All responses are JSON. 🔒 means the request needs `Authorization: Bearer <token>`.

### Auth: `/api/auth`

| Method | Endpoint | Body | Description |
| :--- | :--- | :--- | :--- |
| POST | `/register` | `firstName`, `lastName`, `email`, `password` | Create an account |
| POST | `/login` | `email`, `password` | Returns `user` and `token` |
| GET | `/me` 🔒 | none | Current user |

**Validation:** names need at least 3 characters, the email must be valid (stored in lowercase), and the password needs at least 6 characters.

### Chats: `/api/chat`

| Method | Endpoint | Body | Description |
| :--- | :--- | :--- | :--- |
| POST | `/chats` 🔒 | `title` (optional) | Create a chat |
| GET | `/chats` 🔒 | none | List your chats (newest first, max 100) |
| GET | `/chats/:chatId/messages` 🔒 | none | Get all messages of a chat |
| POST | `/chats/:chatId/messages` 🔒 | `question` (1-4000 chars) | Ask a question; returns the saved user and assistant messages |
| PATCH | `/chats/:chatId` 🔒 | `title` | Rename a chat |
| DELETE | `/chats/:chatId` 🔒 | none | Delete a chat and its messages |

**Error format:** `{ "success": false, "message": "..." }`. Server errors (500+) return a generic message; the real cause is in the server logs.

## 🔄 How a Message Is Processed

1. The browser sends the question to `POST /api/chat/chats/:chatId/messages`.
2. The backend checks that the chat belongs to the logged-in user.
3. It loads the last 10 messages as context and asks Gemini for a reply.
4. If Gemini succeeds, both messages are saved in one transaction and the chat's `updated_at` is refreshed. If it fails, nothing is saved.
5. The first question of a new chat becomes the chat title.

## ☁️ Deployment

**Backend + MySQL (Railway)**

1. Create a project with a **MySQL** service and a backend service (root directory: `backend`).
2. Add the backend variables, using the MySQL service's connection details for `DB_*`.
3. Create the tables in the Railway query tab, **one statement at a time**.
4. Push to GitHub. Railway redeploys automatically; the logs should show `Database connected successfully!`.

**Frontend (Netlify)**

1. Base directory: `frontend`, build command: `npm run build`, publish directory: `dist`.
2. Set `VITE_API_URL` to your Railway backend URL.
3. Add `frontend/public/_redirects` so refreshing `/login` or `/register` does not return 404:

```text
/*    /index.html   200
```

## 🩺 Troubleshooting

| Problem | Fix |
| :--- | :--- |
| `Unknown column 'user_id'` | The table does not match the code (for example an old `users` table with `id`). Recreate it using the SQL above. |
| Register works locally but returns 500 online | The live database schema or the deployed code differs from local. Check the Railway logs and the latest deployed commit. |
| "Cannot reach the server" | Backend is redeploying or crashed, CORS rejects the frontend, or `VITE_API_URL` is wrong. |
| 404 on `/register` after refresh | The `_redirects` file is missing on Netlify. |
| "Error in your SQL syntax" in Railway | The query box runs only one statement at a time. |
| Foreign key creation fails | Both columns must have exactly the same type (for example `INT` and `INT`). |
| Server crashes on startup | `JWT_SECRET` is missing. |

## 📝 Known Issues & To-Do

- [ ] Remove the old unprotected routes `POST/GET /api/chat/conversations` and their service functions (`createConversationService`, `getRecentConversationRows`)
- [ ] Delete the unused `backend/src/controllers/auth.controller.js`
- [ ] Keep the schema file or migrations in sync with the code
- [ ] Restrict CORS (it currently allows every origin)
- [ ] Add rate limiting to login and register
- [ ] Lower the name minimum from 3 to 2 characters in `auth.validation.js`
- [ ] Implement `/api/admin` (currently commented out in the main routes file)

## 👤 Author

**Sadik**: Full-stack developer (React, Node.js, Express, MySQL, AI API integration)