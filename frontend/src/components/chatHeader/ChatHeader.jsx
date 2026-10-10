import { ChevronDown, LogOut, Menu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import styles from './ChatHeader.module.css';

function ChatHeader({ onOpenSidebar }) {
  const { user, logout } = useAuth();

  // "Sadik Jemal" -> "SJ"
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* Only visible on phones, where the sidebar is hidden by default */}
        <button
          type='button'
          className={styles.menuBtn}
          onClick={onOpenSidebar}
          aria-label='Open sidebar'
        >
          <Menu size={20} />
        </button>
        <span>ChatGPT</span>

        <ChevronDown size={16} />
       
      </div>
      <div className={styles.right}>
        <button
          type='button'
          className={styles.logoutBtn}
          onClick={logout}
          aria-label='Log out'
        >
          <LogOut size={16} />
          <span className={styles.logoutText}>Log out</span>
        </button>
        <div className={styles.avatar} title={fullName}>
          {initials}
        </div>
      </div>
    </header>
  );
}
 export default ChatHeader;
