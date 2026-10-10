import { CircleAlert, X } from "lucide-react";
import styles from "./ErrorBanner.module.css";

// A dismissible error message with an optional "Retry" button
export default function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div className={styles.banner} role="alert">
      <CircleAlert size={16} className={styles.icon} />
      <span className={styles.text}>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
      <button
        type="button"
        className={styles.close}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
