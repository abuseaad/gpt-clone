import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import styles from "./ProtectedRoute.module.css";

// Wrap any page that needs a logged-in user:
// <ProtectedRoute><App /></ProtectedRoute>
export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Still asking the server who the token belongs to
  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <Loader2 size={28} className={styles.spinner} />
        <span>Loading…</span>
      </div>
    );
  }

  // Not logged in: go to the login page, remembering where they wanted to go
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}