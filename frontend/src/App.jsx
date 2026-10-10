import Sidebar from "./components/sidebar/Sidebar";
import { useEffect, useState, useRef } from "react";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import axios from "axios";
import ChatInput from "./components/ChatInput/ChatInput";

// Grab the API base URL from Vite's environment variables, defaulting to localhost for local testing
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888";

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastMessageRef = useRef(null);

  async function fetchConversation() {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/chat/conversations`
      );
      setConversations(data.data);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function handleSubmit(question) {
    if (!question.trim()) {
      return;
    }

    const tempQuestion = {
      id: Date.now(),
      content: question.trim(),
      role: 'user',
    };
    setConversations((prev) => [...prev, tempQuestion]);

    try {
      setIsLoading(true);
      const { data } = await axios.post(`${API_BASE_URL}/api/chat/conversations`, {
        question: question.trim(),
      });
      setConversations((prev) => [...prev, data?.data?.assistantConversation]);
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isLoading]);

  useEffect(() => {
    fetchConversation();
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <main className="chat">
        <ChatHeader />
        <MessageList lastMessageRef={lastMessageRef} isLoading={isLoading} conversations={conversations} />
        <ChatInput isLoading={isLoading} handleSubmit={handleSubmit} />
      </main> 
    </div>
  );
}

export default App;