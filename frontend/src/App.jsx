import Sidebar from "./components/sidebar/Sidebar";
import { useEffect, useState, useRef } from "react";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import ErrorBanner from "./components/ErrorBanner/ErrorBanner";
import client, { getErrorMessage } from "./api/client";

// Screens wider than this show the sidebar open by default
const DESKTOP_QUERY = "(min-width: 769px)";

// Ask the server for THIS user's chats (newest activity first)
const fetchChats = () =>
  client.get("/api/chat/chats").then(({ data }) => data.data);

function App() {
  // --- Chat history (sidebar) ---
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState("");

  // --- The chat that is open ---
  const [activeChatId, setActiveChatId] = useState(null); // null = a new, empty chat
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // waiting for the AI
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const [notice, setNotice] = useState(null); // { message, onRetry }

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );

  const lastMessageRef = useRef(null);
  const openRequestRef = useRef(0); // lets us ignore out-of-date "open chat" replies

  // ---------- Sidebar ----------
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  const closeSidebarOnMobile = () => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) setIsSidebarOpen(false);
  };

  // ---------- Chat history ----------
  const reloadChats = () => {
    setChatsLoading(true);
    setChatsError("");
    fetchChats()
      .then(setChats)
      .catch((error) => setChatsError(getErrorMessage(error)))
      .finally(() => setChatsLoading(false));
  };

  // ---------- New chat ----------
  // Only clears the screen. The chat is created on the server when the user
  // sends the first message, and old chats are never deleted.
  const handleNewChat = () => {
    if (isLoading) return;
    openRequestRef.current += 1; // cancel any chat that is still loading
    setActiveChatId(null);
    setMessages([]);
    setIsOpeningChat(false);
    setNotice(null);
    closeSidebarOnMobile();
  };

  // ---------- Open an old chat ----------
  async function handleSelectChat(chatId) {
    if (isLoading) return;
    closeSidebarOnMobile();
    if (chatId === activeChatId) return;

    const requestId = ++openRequestRef.current;
    setActiveChatId(chatId);
    setMessages([]);
    setIsOpeningChat(true);
    setNotice(null);

    try {
      const { data } = await client.get(`/api/chat/chats/${chatId}/messages`);
      if (requestId !== openRequestRef.current) return; // user clicked something else
      setMessages(data.data);
    } catch (error) {
      if (requestId !== openRequestRef.current) return;
      setNotice({
        message: `Could not open this chat. ${getErrorMessage(error)}`,
        onRetry: () => handleSelectChat(chatId),
      });
    } finally {
      if (requestId === openRequestRef.current) setIsOpeningChat(false);
    }
  }

  // ---------- Send a message ----------
  async function handleSubmit(question) {
    const text = question.trim();
    if (!text || isLoading) {
      return;
    }

    setNotice(null);
    setIsLoading(true);

    // Show the user's message immediately (replaced by the saved one later)
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);

    let chatId = activeChatId;
    let createdHere = false;

    try {
      // First message of a new chat? Create the chat on the server first.
      if (chatId === null) {
        const { data } = await client.post("/api/chat/chats", {});
        chatId = data.data.id;
        createdHere = true;
        setActiveChatId(chatId);
      }

      const { data } = await client.post(`/api/chat/chats/${chatId}/messages`, {
        question: text,
      });
      const { userMessage, assistantMessage, chat } = data.data;

      // Replace the temporary message with the saved ones
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        userMessage,
        assistantMessage,
      ]);

      // Put this chat at the top of the history (new title included)
      setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      // Don't leave an empty chat behind if the very first message failed
      if (createdHere) {
        client.delete(`/api/chat/chats/${chatId}`).catch(() => {});
        setActiveChatId(null);
      }

      setNotice({
        message: `Your message could not be sent. ${getErrorMessage(error)}`,
        onRetry: () => handleSubmit(text),
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Keep the newest message in view
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load this user's chat history when the page opens
  useEffect(() => {
    let cancelled = false;
    fetchChats()
      .then((list) => {
        if (!cancelled) setChats(list);
      })
      .catch((error) => {
        if (!cancelled) setChatsError(getErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setChatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Open the sidebar when the window becomes wide, close it when it becomes narrow
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event) => setIsSidebarOpen(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="app">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        chats={chats}
        chatsLoading={chatsLoading}
        chatsError={chatsError}
        onReloadChats={reloadChats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        disabled={isLoading}
      />
      <main className="chat">
        <ChatHeader onOpenSidebar={toggleSidebar} />
        <MessageList
          lastMessageRef={lastMessageRef}
          isLoading={isLoading}
          isOpeningChat={isOpeningChat}
          conversations={messages}
        />
        {notice && (
          <ErrorBanner
            message={notice.message}
            onRetry={notice.onRetry}
            onDismiss={() => setNotice(null)}
          />
        )}
        <ChatInput
          isLoading={isLoading || isOpeningChat}
          handleSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}

export default App;
