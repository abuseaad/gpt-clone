import {
  MessageSquare,
  Search,
  Image as ImageIcon,
  LayoutGrid,
  Microscope,
  Code2,
  FolderKanban,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  CircleAlert,
} from 'lucide-react';
import styles from './Sidebar.module.css';

// These features are not built yet. They are shown disabled with a "Soon"
// badge instead of pretending to work.
const comingSoonItems = [
  { id: 'search', label: 'Search chats', icon: Search },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'apps', label: 'Apps', icon: LayoutGrid },
  { id: 'research', label: 'Deep research', icon: Microscope },
  { id: 'codex', label: 'Codex', icon: Code2 },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
];

export default function Sidebar({
  isOpen,
  onToggle,
  chats,
  chatsLoading,
  chatsError,
  onReloadChats,
  activeChatId,
  onNewChat,
  onSelectChat,
  disabled,
}) {
  return (
    <>
      {/* Phones only: dark area behind the open sidebar; tap it to close */}
      {isOpen && (
        <div className={styles.overlay} onClick={onToggle} aria-hidden='true' />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
        aria-label='Sidebar'
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <button
              type='button'
              className={styles.iconBtn}
              onClick={onToggle}
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-expanded={isOpen}
            >
              {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>
          <button
            type='button'
            className={styles.iconBtn}
            onClick={onNewChat}
            disabled={disabled}
            aria-label='New chat'
          >
            <MessageSquare size={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label='Main'>
          <button
            type='button'
            className={`${styles.item} ${activeChatId === null ? styles.active : ''}`}
            onClick={onNewChat}
            disabled={disabled}
          >
            <MessageSquare size={18} />
            <span className={styles.label}>New chat</span>
          </button>

          {comingSoonItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type='button'
              className={styles.item}
              disabled
              title='Coming soon'
            >
              <Icon size={18} />
              <span className={styles.label}>{label}</span>
              <span className={styles.soon}></span>
            </button>
          ))}
        </nav>

        {/* Conversation history, directly below the navigation items */}
        <section className={styles.history} aria-label='Chat history'>
          <h2 className={styles.historyTitle}>Chats</h2>

          {chatsLoading && (
            <div className={styles.status} role='status'>
              <Loader2 size={16} className={styles.spinner} />
              <span>Loading chats…</span>
            </div>
          )}

          {!chatsLoading && chatsError && (
            <div className={styles.statusError} role='alert'>
              <CircleAlert size={16} />
              <span>{chatsError}</span>
              <button type='button' className={styles.retry} onClick={onReloadChats}>
                Retry
              </button>
            </div>
          )}

          {!chatsLoading && !chatsError && chats.length === 0 && (
            <p className={styles.empty}>No chats yet. Send a message to start one.</p>
          )}

          {!chatsLoading && !chatsError && chats.length > 0 && (
            <ul className={styles.chatList}>
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    type='button'
                    className={`${styles.chatItem} ${
                      chat.id === activeChatId ? styles.chatActive : ''
                    }`}
                    onClick={() => onSelectChat(chat.id)}
                    disabled={disabled}
                    aria-current={chat.id === activeChatId ? 'page' : undefined}
                    title={chat.title}
                  >
                    <span className={styles.chatTitle}>{chat.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </>
  );
}
