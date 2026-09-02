# GPT Clone Frontend

A React + Vite frontend for a ChatGPT-style AI conversation app. It connects to a Node.js backend, sends user questions, displays conversation history, and renders assistant responses in a chat interface.

## Features

- Chat layout with sidebar and conversation panel
- Real-time message fetching from backend API
- User prompt submission and assistant response display
- Loading state while AI response is being generated
- Markdown rendering for assistant messages
- Responsive styling with modular CSS
- ChatGPT-style disclaimer text under the input area

## Tech Stack

- React
- Vite
- Axios
- Lucide React
- React Markdown

## Project Structure

```bash
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ChatHeader/
│   │   ├── ChatInput/
│   │   ├── ChatMessage/
│   │   ├── MessageList/
│   │   └── sidebar/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── assets/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md